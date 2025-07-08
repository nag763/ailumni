const { DynamoDBClient, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({});

exports.handler = async (event) => {
  const userSub = event.requestContext.authorizer.jwt.claims.sub;
  const tableName = process.env.DYNAMODB_TABLE;
  const { itemId } = event.pathParameters;

  console.log(`Deleting item with id '${itemId}' for user '${userSub}' in table '${tableName}'`);

  const params = {
    TableName: tableName,
    Key: {
      user_sub: { S: userSub },
      item_id: { S: itemId },
    },
  };

  try {
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
};
