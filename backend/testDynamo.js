require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,        // must match your DynamoDB region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,     // optional if using IAM role
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // optional if using IAM role
});

const dynamo = new AWS.DynamoDB.DocumentClient();

async function testConnection() {
  try {
    const res = await dynamo.scan({
      TableName: process.env.DDB_USERS_TABLE || "Users",
      Limit: 1
    }).promise();

    console.log("DynamoDB connection successful. Sample data:", res.Items);
  } catch (err) {
    console.error("DynamoDB connection failed:", err);
  }
}

testConnection();
