const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({});

exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event));
  
  const userSub = event.requestContext.authorizer.jwt.claims.sub;
  const tableName = process.env.DYNAMODB_TABLE;

  console.log(`Querying table ${tableName} for user ${userSub}`);

  const params = {
    TableName: tableName,
    KeyConditionExpression: "user_sub = :s",
    ExpressionAttributeValues: {
      ":s": { S: userSub },
    },
    Limit: 5,
    ScanIndexForward: false // Optional: to get the latest entries if you have a sort key like a timestamp
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
};
