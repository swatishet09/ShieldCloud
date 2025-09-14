
const AWS = require("./awsConfig");
const csv = require("csv-parser");
const s3 = new AWS.S3();

function isEmailInS3Csv(bucket, key, email) {
  return new Promise((resolve, reject) => {
    if (!bucket || !key || !email) {
      return reject(new Error("Missing bucket, key, or email"));
    }

    const params = { Bucket: bucket, Key: key };
    const s3Stream = s3.getObject(params).createReadStream();
    let found = false;

    console.log(`[DEBUG] Reading CSV from s3://${bucket}/${key}`);

    s3Stream
      .pipe(csv())
      .on("data", (row) => {
        if (row.email && row.email.trim().toLowerCase() === email.toLowerCase()) {
          found = true;
          console.log(`[DEBUG] Email found in CSV: ${email}`);
          s3Stream.destroy();
        }
      })
      .on("end", () => {
        console.log(`[DEBUG] Finished reading CSV. Found: ${found}`);
        resolve(found);
      })
      .on("error", (err) => {
        console.error("S3 CSV Error:", err);
        reject(err);
      });
  });
}

module.exports = { isEmailInS3Csv };
