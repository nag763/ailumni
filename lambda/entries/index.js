const { DynamoDBClient, QueryCommand, GetItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const client = new DynamoDBClient({});
const docClient = new DynamoDBDocumentClient(client);
const s3Client = new S3Client({});
const tableName = process.env.DYNAMODB_TABLE;
const bucketName = process.env.S3_BUCKET_NAME;

exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event));
  const userSub = event.requestContext.authorizer.jwt.claims.sub;

  switch (event.routeKey) {
    case "GET /api/v1/user/entries":
      return getEntries(userSub);
    case "POST /api/v1/user/entries":
      return createEntry(userSub, JSON.parse(event.body));
    case "DELETE /api/v1/user/entries/{itemId}":
      return deleteEntry(userSub, event.pathParameters.itemId);
    case "GET /api/v1/user/entries/{itemId}":
      return getEntry(userSub, event.pathParameters.itemId);
    case "GET /api/v1/user/entries/{itemId}/files":
      return listFiles(userSub, event.pathParameters.itemId);
    case "GET /api/v1/user/entries/{itemId}/upload-url":
      return getUploadUrl(userSub, event.pathParameters.itemId, event.queryStringParameters.fileName);
    case "DELETE /api/v1/user/entries/{itemId}/files":
      return deleteFile(userSub, event.pathParameters.itemId, event.queryStringParameters.fileName);
    default:
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Not Found" }),
      };
  }
};

async function getEntries(userSub) {
  console.log(`Querying table ${tableName} for user ${userSub}`);

  const params = {
    TableName: tableName,
    KeyConditionExpression: "user_sub = :s",
    ExpressionAttributeValues: {
      ":s": { S: userSub },
    },
    Limit: 5,
    ScanIndexForward: false
  };

  try {
    const command = new QueryCommand(params);
    const { Items } = await client.send(command);
    console.log('Query response:', JSON.stringify(Items));
    
    const unmarshalledItems = Items.map(item => unmarshall(item));
    console.log('Unmarshalled items:', JSON.stringify(unmarshalledItems));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unmarshalledItems),
    };
  } catch (error) {
    console.error('Error executing query:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error retrieving user data" }),
    };
  }
}

async function createEntry(userSub, { label }) {
  const itemId = uuidv4();

  // First, check the number of existing entries for the user
  const queryParams = {
    TableName: tableName,
    KeyConditionExpression: "user_sub = :s",
    ExpressionAttributeValues: {
      ":s": { S: userSub },
    },
  };

  try {
    const queryCommand = new QueryCommand(queryParams);
    const { Count } = await client.send(queryCommand);

    if (5 <= Count ) {
      return {
        statusCode: 400, // Forbidden
        body: JSON.stringify({ message: "User cannot have more than 5 entries." }),
      };
    }
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error checking user entries" }),
    };
  }

  console.log(`Creating item with label '${label}' and id '${itemId}' for user '${userSub}' in table '${tableName}'`);

  const putParams = {
    TableName: tableName,
    Item: {
      user_sub: userSub,
      item_id: itemId,
      label: label,
      created_at: new Date().toISOString(),
    },
  };

  try {
    const putCommand = new PutCommand(putParams);
    await docClient.send(putCommand);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Item created successfully", ...putParams.Item }),
    };
  } catch (error) {
    console.error('Error executing PutCommand:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creating item" }),
    };
  }
}

async function deleteEntry(userSub, itemId) {
  console.log(`Deleting item with id '${itemId}' for user '${userSub}' in table '${tableName}'`);
  const userFolder = `${userSub}/${itemId}/`;

  const params = {
    TableName: tableName,
    Key: {
      user_sub: { S: userSub },
      item_id: { S: itemId },
    },
  };

  try {
    // Delete all objects in the user's folder
    const { Contents } = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName, Prefix: userFolder }));
    if (Contents && Contents.length > 0) {
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: Contents.map(({ Key }) => ({ Key }))
        }
      };
      await s3Client.send(new DeleteObjectsCommand(deleteParams));
    }

    const command = new DeleteItemCommand(params);
    await client.send(command);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Item deleted successfully" }),
    };
  } catch (error) {
    console.error('Error executing DeleteItemCommand:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error deleting item" }),
    };
  }
}

async function getEntry(userSub, itemId) {
  console.log(`Retrieving entry with itemId: ${itemId} for user: ${userSub}`);

  const params = {
    TableName: tableName,
    Key: {
      user_sub: { S: userSub },
      item_id: { S: itemId },
    },
  };

  try {
    const command = new GetItemCommand(params);
    const { Item } = await client.send(command);

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Entry not found" }),
      };
    }

    const unmarshalledItem = unmarshall(Item);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unmarshalledItem),
    };
  } catch (error) {
    console.error('Error executing GetItem:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error retrieving entry" }),
    };
  }
}

async function listFiles(userSub, itemId) {
  const userFolder = `${userSub}/${itemId}/`;

  try {
    const { Contents } = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName, Prefix: userFolder }));
    if(!Contents) {
      return {
        statusCode: 204,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "No files found" }),
      }
    } 
    const files = Contents.map(file => ({
      key: file.Key.replace(userFolder, ""),
      lastModified: file.LastModified,
      size: file.Size,
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(files),
    };
  } catch (error) {
    console.error('Error listing files:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error listing files" }),
    };
  }
}

async function getUploadUrl(userSub, itemId, fileName) {
  const allowedExtensions = ['txt', 'md', 'json', 'csv', 'log'];
  const fileExtension = fileName.split('.').pop().toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `File type .${fileExtension} is not allowed.` }),
    };
  }

  const key = `${userSub}/${itemId}/${fileName}`;
  const command = new PutObjectCommand({ Bucket: bucketName, Key: key });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error generating upload URL" }),
    };
  }
}

async function deleteFile(userSub, itemId, fileName) {
  const key = `${userSub}/${itemId}/${fileName}`;
  const deleteParams = {
    Bucket: bucketName,
    Delete: {
      Objects: [{ Key: key }]
    }
  };

  try {
    await s3Client.send(new DeleteObjectsCommand(deleteParams));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "File deleted successfully" }),
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error deleting file" }),
    };
  }
}
