const AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.AWS_REGION,
  // On Lambda, IAM role is used automatically; locally you can use env keys.
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports = dynamo;
