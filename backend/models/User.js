
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   username: { type: String, unique: true, sparse: true, trim: true }, // Added username field
//   email: { type: String, unique: true, required: true },
//   dateOfBirth: { type: Date, required: true },
//   password: { type: String, required: true },
//   role: { 
//     type: String, 
//     enum: ['admin', 'doctor', 'patient', 'researcher'], 
//     required: true 
//   },
//   mfaCode: { type: String, default: null },
//   mfaExpiry: { type: Date, default: null }
// });

// module.exports = mongoose.model('User', userSchema);




// backend/models/User.js

const dynamo = require("../db/dynamo");
const TABLE = process.env.DDB_USERS_TABLE || "Users";

// ---- reads ----
async function getByEmail(email) {
  const res = await dynamo.get({ TableName: TABLE, Key: { email } }).promise();
  return res.Item || null;
}

async function getByUsername(username) {
  const res = await dynamo.query({
    TableName: TABLE,
    IndexName: "UsernameIndex",
    KeyConditionExpression: "#u = :u",
    ExpressionAttributeNames: { "#u": "username" },
    ExpressionAttributeValues: { ":u": username },
    Limit: 1,
  }).promise();
  return res.Items && res.Items[0] ? res.Items[0] : null;
}

// ---- writes ----
async function createUser(item) {
  await dynamo.put({
    TableName: TABLE,
    Item: item,
    ConditionExpression: "attribute_not_exists(email)" // prevents duplicate emails
  }).promise();
}

async function setMFA(email, code, expiryMs) {
  await dynamo.update({
    TableName: TABLE,
    Key: { email },
    UpdateExpression: "SET mfaCode = :c, mfaExpiry = :e",
    ExpressionAttributeValues: { ":c": code, ":e": expiryMs },
  }).promise();
}

async function clearMFA(email) {
  await dynamo.update({
    TableName: TABLE,
    Key: { email },
    UpdateExpression: "REMOVE mfaCode, mfaExpiry",
  }).promise();
}

// convenience: check duplicates for email OR username
async function existsByEmailOrUsername(email, username) {
  const byEmail = await getByEmail(email);
  if (byEmail) return true;
  if (username) {
    const byUser = await getByUsername(username);
    if (byUser) return true;
  }
  return false;
}

module.exports = {
  getByEmail,
  getByUsername,
  createUser,
  setMFA,
  clearMFA,
  existsByEmailOrUsername,
};
