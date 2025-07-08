const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = new DynamoDBDocumentClient(client);

exports.handler = async (event) => {
  const userSub = event.requestContext.authorizer.jwt.claims.sub;
  const tableName = process.env.DYNAMODB_TABLE;
  const { label } = JSON.parse(event.body);
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
      body: JSON.stringify({ message: "Item created successfully", itemId: itemId }),
    };
  } catch (error) {
    console.error('Error executing PutCommand:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creating item" }),
    };
  }
};