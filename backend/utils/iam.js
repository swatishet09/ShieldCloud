
// utils/iam.js
const AWS = require("./awsConfig");
const iam = new AWS.IAM();

/**
 * Check if an IAM User exists with the given username.
 * Used only for admins.
 */
async function isValidIamUser(username) {
  try {
    await iam.getUser({ UserName: username }).promise();
    return true;
  } catch (err) {
    if (err.code === "NoSuchEntity") return false;
    console.error("IAM Error:", err);
    throw err;
  }
}

module.exports = { isValidIamUser };
