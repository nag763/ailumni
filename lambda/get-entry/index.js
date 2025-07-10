const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({});

exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event));

  const userSub = event.requestContext.authorizer.jwt.claims.sub;
  const tableName = process.env.DYNAMODB_TABLE;
  const { itemId } = event.pathParameters;

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
};