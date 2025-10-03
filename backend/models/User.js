
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


const { v4: uuidv4 } = require("uuid");
const dynamo = require("../db/dynamo");
const TABLE = process.env.DDB_USERS_TABLE || "Users";

// ---- reads ----

// Get user by email (using GSI "EmailIndex")
async function getByEmail(email) {
  const res = await dynamo.query({
    TableName: TABLE,
    IndexName: "EmailIndex", // make sure GSI exists
    KeyConditionExpression: "email = :e",
    ExpressionAttributeValues: { ":e": email },
    Limit: 1,
  }).promise();

  return res.Items && res.Items[0] ? res.Items[0] : null;
}

// Get user by username (using GSI "UsernameIndex")
async function getByUsername(username) {
  const res = await dynamo.query({
    TableName: TABLE,
    IndexName: "UsernameIndex",
    KeyConditionExpression: "username = :u",
    ExpressionAttributeValues: { ":u": username },
    Limit: 1,
  }).promise();

  return res.Items && res.Items[0] ? res.Items[0] : null;
}

// Get user by login input (email or username)
async function getByLoginInput(loginInput) {
  let user = await getByEmail(loginInput);
  if (!user) user = await getByUsername(loginInput);
  return user;
}

// ---- writes ----

// Create new user
async function createUser(data) {
  // Validate email (always required)
  if (!data.email) throw new Error("Email is required");

  // Role-based username requirement
  if (data.role === "admin" && !data.username) {
    throw new Error("Username is required for admin");
  }

  // Ensure email/username uniqueness before inserting
  const exists =
    (await getByEmail(data.email)) ||
    (data.username ? await getByUsername(data.username) : null);

  if (exists) throw new Error("Email or username already exists");

  const item = {
    id: uuidv4(),
    email: data.email,
    username: data.username || null,  // Will be null for patient/doctor if not provided
    name: data.fullName,
    role: data.role,
    createdAt: new Date().toISOString(),
    password: data.password,     // already hashed outside
    dateOfBirth: data.dateOfBirth,
  };

  await dynamo.put({
    TableName: TABLE,
    Item: item,
  }).promise();

  return item;
}


// Set MFA code and expiry (query user first to get id)
async function setMFA(email, code, expiryMs) {
  const user = await getByEmail(email);
  if (!user) throw new Error("User not found");

  await dynamo.update({
    TableName: TABLE,
    Key: { id: user.id },
    UpdateExpression: "SET mfaCode = :c, mfaExpiry = :e",
    ExpressionAttributeValues: { ":c": code, ":e": expiryMs },
  }).promise();
}

// Clear MFA code
async function clearMFA(email) {
  const user = await getByEmail(email);
  if (!user) throw new Error("User not found");

  await dynamo.update({
    TableName: TABLE,
    Key: { id: user.id },
    UpdateExpression: "REMOVE mfaCode, mfaExpiry",
  }).promise();
}

// Check if email or username already exists
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
  getByLoginInput,
  createUser,
  setMFA,
  clearMFA,
  existsByEmailOrUsername,
};
