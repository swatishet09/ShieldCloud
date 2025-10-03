

// const AWS = require("./awsConfig");
// const csv = require("csv-parser");
// const s3 = new AWS.S3();

// function isEmailInS3Csv(bucket, key, email) {
//   return new Promise((resolve, reject) => {
//     if (!bucket || !key || !email) return reject(new Error("Missing bucket, key, or email"));

//     const params = { Bucket: bucket, Key: key };
//     const s3Stream = s3.getObject(params).createReadStream();
//     let found = false;

//     s3Stream
//       .pipe(csv())
//       .on("data", row => {
//         if (row.email && row.email.trim().toLowerCase() === email.toLowerCase()) {
//           found = true;
//           s3Stream.destroy();
//         }
//       })
//       .on("end", () => resolve(found))
//       .on("error", err => reject(err));
//   });
// }

// module.exports = { isEmailInS3Csv };


// utils/s3AllowList.js
const AWS = require("./awsConfig");
const csv = require("csv-parser");
const { Readable } = require("stream");

const s3 = new AWS.S3();

/**
 * Check if an email exists inside an S3 CSV file
 */
async function isEmailInS3Csv(bucket, key, email) {
  if (!bucket || !key || !email) {
    throw new Error("❌ Missing bucket, key, or email");
  }

  console.log(`🔍 Checking S3 allow-list: bucket=${bucket}, key=${key}, email=${email}`);

  try {
    // 1. Fetch object from S3
    const obj = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    const body = obj.Body.toString("utf-8");

    // 2. Parse CSV
    return await new Promise((resolve, reject) => {
      let found = false;
      let rowCount = 0;

      Readable.from(body)
        .pipe(csv())
        .on("data", (row) => {
          rowCount++;
          if (row.email && row.email.trim().toLowerCase() === email.toLowerCase()) {
            console.log(`✅ Match found in CSV at row ${rowCount}`);
            found = true;
          }
        })
        .on("end", () => {
          console.log(`📊 Finished parsing CSV. Rows processed: ${rowCount}, found=${found}`);
          resolve(found);
        })
        .on("error", (err) => {
          console.error("❌ Error parsing CSV:", err);
          reject(err);
        });
    });
  } catch (err) {
    console.error("❌ S3 fetch failed:", err);
    return false;
  }
}

module.exports = { isEmailInS3Csv };
