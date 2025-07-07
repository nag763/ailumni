const { DynamoDBClient, PutCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});

exports.handler = async (event) => {

  const userSub = event.requestContext.authorizer.jwt.claims.sub;
  const tableName = process.env.DYNAMODB_TABLE;
  const { label } = JSON.parse(event.body);
  const itemId = uuidv4();

  console.log(`Creating item with label '${label}' and id '${itemId}' for user '${userSub}' in table '${tableName}'`);

  const params = {
    TableName: tableName,
    Item: marshall({
      user_sub: userSub,
      item_id: itemId,
      label: label,
      created_at: new Date().toISOString(),
    }),
  };

  try {
    const command = new PutCommand(params);
    await client.send(command);
    console.log('PutCommand successful');

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