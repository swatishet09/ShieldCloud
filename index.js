// // index-store.js
// // Node.js 18.x (CommonJS)
// const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
// const { parse } = require("csv-parse/sync");
// const { stringify } = require("csv-stringify/sync");

// const REGION = process.env.REGION || "ap-south-1";
// const ORIGINAL_BUCKET = process.env.ORIGINAL_BUCKET; // e.g. "mimic-original-data"
// const NOISY_BUCKET = process.env.NOISY_BUCKET;       // e.g. "mimic-noisy-data"

// const s3 = new S3Client({ region: REGION });

// /* --- Sensitive attribute obfuscation --- */
// const SENSITIVE = [
//   "firstName",
//   "lastName",
//   "phone",
//   "address",
//   "email",
//   "ethnicity",
//   "doctorName",
//   "doctorEmail"
// ];

// function rand(n = 10000) { return Math.floor(Math.random() * n); }

// function obfuscateEmail(e) {
//   if (!e || typeof e !== "string") return e;
//   const first = (e.split("@")[0] || "").slice(0,1) || "u";
//   return `${first}***@noisy.com`;
// }
// function obfuscatePhone(p) {
//   if (!p || typeof p !== "string") return p;
//   const s = p.replace(/\D/g, "");
//   if (s.length <= 4) return "XXXXX" + s;
//   return "XXXXX" + s.slice(-4);
// }
// function obfuscateName() {
//   return `Anon_${rand(9000)+1000}`;
// }
// function obfuscateAddress() {
//   return `Hidden Address #${rand(200)}`;
// }
// function obfuscateEthnicity() {
//   return `Generalized_${rand(10)}`;
// }

// function applyNoiseSensitive(record) {
//   const noisy = { ...record };
//   for (const k of SENSITIVE) {
//     if (noisy[k] === undefined || noisy[k] === null) continue;
//     const val = String(noisy[k]);
//     if (k === "phone") noisy[k] = obfuscatePhone(val);
//     else if (k === "email" || k === "doctorEmail") noisy[k] = obfuscateEmail(val);
//     else if (k === "firstName" || k === "lastName" || k === "doctorName") noisy[k] = obfuscateName();
//     else if (k === "address") noisy[k] = obfuscateAddress();
//     else if (k === "ethnicity") noisy[k] = obfuscateEthnicity();
//     else noisy[k] = `Obfuscated_${rand(1000)}`;
//   }
//   return noisy;
// }

// /* --- S3 helpers --- */
// async function streamToString(stream) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];
//     stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
//     stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
//     stream.on("error", reject);
//   });
// }

// async function fetchCSV(bucket, key) {
//   try {
//     const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
//     const res = await s3.send(cmd);
//     const body = await streamToString(res.Body);
//     const rows = parse(body, { columns: true, skip_empty_lines: true });
//     return rows;
//   } catch (err) {
//     // if not found or other error, return empty array so upload can create new file
//     return [];
//   }
// }

// async function uploadStringToS3(bucket, key, bodyStr, contentType = "text/csv") {
//   const put = new PutObjectCommand({
//     Bucket: bucket,
//     Key: key,
//     Body: bodyStr,
//     ContentType: contentType,
//   });
//   await s3.send(put);
// }

// /* --- Lambda handler --- */
// exports.handler = async (event) => {
//   try {
//     // event.body expected to be a JSON string: { type, fileName, fileContent, record }
//     const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
//     const { type, fileName, fileContent, record } = body;

//     if (!fileName) {
//       return {
//         statusCode: 400,
//         headers: { "Access-Control-Allow-Origin": "*" },
//         body: JSON.stringify({ error: "fileName is required" }),
//       };
//     }

//     if (type === "file") {
//       // fileContent must be base64 CSV content
//       if (!fileContent) {
//         return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: "fileContent required" }) };
//       }

//       const buffer = Buffer.from(fileContent, "base64");
//       const csvText = buffer.toString("utf-8");
//       const records = parse(csvText, { columns: true, skip_empty_lines: true });

//       const noisyRecords = records.map(r => applyNoiseSensitive(r));

//       // Save original (keep same CSV bytes)
//       await s3.send(new PutObjectCommand({
//         Bucket: ORIGINAL_BUCKET,
//         Key: fileName,
//         Body: buffer,
//         ContentType: "text/csv",
//       }));

//       // Save noisy (stringified csv)
//       const noisyCsv = stringify(noisyRecords, { header: true });
//       await uploadStringToS3(NOISY_BUCKET, fileName, noisyCsv);

//       return {
//         statusCode: 200,
//         headers: { "Access-Control-Allow-Origin": "*" },
//         body: JSON.stringify({ message: "CSV uploaded and noisy copy created" }),
//       };
//     }

//     else if (type === "manual") {
//       if (!record || typeof record !== "object") {
//         return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: "record object required" }) };
//       }

//       // fetch existing CSV records (original & noisy)
//       const origRecords = await fetchCSV(ORIGINAL_BUCKET, fileName);
//       const noisyRecords = await fetchCSV(NOISY_BUCKET, fileName);

//       // Append
//       origRecords.push(record);
//       noisyRecords.push(applyNoiseSensitive(record));

//       // Save back both files (as CSV)
//       const origCsv = stringify(origRecords, { header: true });
//       const noisyCsv = stringify(noisyRecords, { header: true });

//       await uploadStringToS3(ORIGINAL_BUCKET, fileName, origCsv);
//       await uploadStringToS3(NOISY_BUCKET, fileName, noisyCsv);

//       return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ message: "Manual entry appended to original and noisy datasets" }) };
//     }

//     return { statusCode: 400, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: "Invalid type (must be 'file' or 'manual')" }) };

//   } catch (err) {
//     console.error("storeHandler error:", err);
//     return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: err.message }) };
//   }
// };
// index-store.js
// Node.js 18.x (CommonJS)




const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

const REGION = process.env.REGION || "ap-south-1";
const ORIGINAL_BUCKET = process.env.ORIGINAL_BUCKET; // e.g. "mimic-original-data"
const NOISY_BUCKET = process.env.NOISY_BUCKET;       // e.g. "mimic-noisy-data"

const s3 = new S3Client({ region: REGION });

/* --- Sensitive attribute obfuscation --- */
const SENSITIVE = [
  "firstName",
  "lastName",
  "phone",
  "address",
  "email",
  "ethnicity",
  "doctorName",
  "doctorEmail"
];

function rand(n = 10000) { return Math.floor(Math.random() * n); }

function obfuscateEmail(e) {
  if (!e || typeof e !== "string") return e;
  const first = (e.split("@")[0] || "").slice(0,1) || "u";
  return `${first}***@noisy.com`;
}
function obfuscatePhone(p) {
  if (!p || typeof p !== "string") return p;
  const s = p.replace(/\D/g, "");
  if (s.length <= 4) return "XXXXX" + s;
  return "XXXXX" + s.slice(-4);
}
function obfuscateName() {
  return `Anon_${rand(9000)+1000}`;
}
function obfuscateAddress() {
  return `Hidden Address #${rand(200)}`;
}
function obfuscateEthnicity() {
  return `Generalized_${rand(10)}`;
}

function applyNoiseSensitive(record) {
  const noisy = { ...record };
  for (const k of SENSITIVE) {
    if (noisy[k] === undefined || noisy[k] === null) continue;
    const val = String(noisy[k]);
    if (k === "phone") noisy[k] = obfuscatePhone(val);
    else if (k === "email" || k === "doctorEmail") noisy[k] = obfuscateEmail(val);
    else if (k === "firstName" || k === "lastName" || k === "doctorName") noisy[k] = obfuscateName();
    else if (k === "address") noisy[k] = obfuscateAddress();
    else if (k === "ethnicity") noisy[k] = obfuscateEthnicity();
    else noisy[k] = `Obfuscated_${rand(1000)}`;
  }
  return noisy;
}

/* --- S3 helpers --- */
async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
}

async function fetchCSV(bucket, key) {
  try {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    const res = await s3.send(cmd);
    const body = await streamToString(res.Body);
    const rows = parse(body, { columns: true, skip_empty_lines: true });
    return rows;
  } catch (err) {
    return [];
  }
}

async function uploadStringToS3(bucket, key, bodyStr, contentType = "text/csv") {
  const put = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: bodyStr,
    ContentType: contentType,
  });
  await s3.send(put);
}

/* --- Lambda handler --- */
exports.handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { type, fileContent, record } = body;

    // ✅ Always target mimic.csv
    const targetFile = "PatientsDetails.csv";

    if (type === "file") {
      if (!fileContent) {
        return { 
          statusCode: 400, 
          headers: { "Access-Control-Allow-Origin": "*" }, 
          body: JSON.stringify({ error: "fileContent required" }) 
        };
      }

      const buffer = Buffer.from(fileContent, "base64");
      const csvText = buffer.toString("utf-8");
      const newRecords = parse(csvText, { columns: true, skip_empty_lines: true });

      // Fetch existing records
      const origRecords = await fetchCSV(ORIGINAL_BUCKET, targetFile);
      const noisyRecords = await fetchCSV(NOISY_BUCKET, targetFile);

      // Merge
      origRecords.push(...newRecords);
      noisyRecords.push(...newRecords.map(r => applyNoiseSensitive(r)));

      // Save back
      const origCsv = stringify(origRecords, { header: true });
      const noisyCsv = stringify(noisyRecords, { header: true });

      await uploadStringToS3(ORIGINAL_BUCKET, targetFile, origCsv);
      await uploadStringToS3(NOISY_BUCKET, targetFile, noisyCsv);

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "CSV merged into PatientsDetails.csv in both buckets" }),
      };
    }

    else if (type === "manual") {
      if (!record || typeof record !== "object") {
        return { 
          statusCode: 400, 
          headers: { "Access-Control-Allow-Origin": "*" }, 
          body: JSON.stringify({ error: "record object required" }) 
        };
      }

      const origRecords = await fetchCSV(ORIGINAL_BUCKET, targetFile);
      const noisyRecords = await fetchCSV(NOISY_BUCKET, targetFile);

      origRecords.push(record);
      noisyRecords.push(applyNoiseSensitive(record));

      const origCsv = stringify(origRecords, { header: true });
      const noisyCsv = stringify(noisyRecords, { header: true });

      await uploadStringToS3(ORIGINAL_BUCKET, targetFile, origCsv);
      await uploadStringToS3(NOISY_BUCKET, targetFile, noisyCsv);

      return { 
        statusCode: 200, 
        headers: { "Access-Control-Allow-Origin": "*" }, 
        body: JSON.stringify({ message: "Manual entry appended to PatientDetails.csv in both buckets" }) 
      };
    }

    return { 
      statusCode: 400, 
      headers: { "Access-Control-Allow-Origin": "*" }, 
      body: JSON.stringify({ error: "Invalid type (must be 'file' or 'manual')" }) 
    };

  } catch (err) {
    console.error("storeHandler error:", err);
    return { 
      statusCode: 500, 
      headers: { "Access-Control-Allow-Origin": "*" }, 
      body: JSON.stringify({ error: err.message }) 
    };
  }
};





// const AWS = require("aws-sdk");
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const s3 = new AWS.S3();

// const BUCKETS = ["hospital-patient-data", "backup-hospital-patient-data"];

// // ----------- Generate Pre-signed URL for Upload -----------
// app.post("/get-presigned-url", async (req, res) => {
//   try {
//     const { fileName, fileType } = req.body;

//     if (!fileName || !fileType) {
//       return res.status(400).json({ error: "Missing fileName or fileType" });
//     }

//     // Generate URLs for both buckets
//     const urls = await Promise.all(
//       BUCKETS.map((bucket) => {
//         const params = {
//           Bucket: bucket,
//           Key: `mimic/${fileName}`, // stored in mimic/ folder
//           Expires: 300, // URL valid for 5 minutes
//           ContentType: fileType,
//         };
//         return s3.getSignedUrlPromise("putObject", params);
//       })
//     );

//     res.json({
//       uploadUrls: urls,
//       filePath: `mimic/${fileName}`,
//     });
//   } catch (err) {
//     console.error("Error generating presigned URL:", err);
//     res.status(500).json({ error: "Could not generate upload URL" });
//   }
// });

// // ----------- Store Manual Patient Entry (still safe) -----------
// app.post("/store-entry", async (req, res) => {
//   try {
//     const { patient } = req.body;
//     if (!patient) {
//       return res.status(400).json({ error: "Missing patient data" });
//     }

//     // Convert JSON to CSV line
//     const csvLine = `${patient.firstName},${patient.lastName},${patient.dateOfBirth},${patient.address},${patient.healthIssue},${patient.allergies},${patient.medications}\n`;

//     await Promise.all(
//       BUCKETS.map(async (bucket) => {
//         const params = {
//           Bucket: bucket,
//           Key: "mimic/mimic.csv",
//         };

//         let existingData = "";
//         try {
//           const data = await s3.getObject(params).promise();
//           existingData = data.Body.toString("utf-8");
//         } catch (err) {
//           if (err.code !== "NoSuchKey") throw err; // ignore if file doesn’t exist
//         }

//         const updatedData = existingData + csvLine;

//         await s3
//           .putObject({
//             Bucket: bucket,
//             Key: "mimic/mimic.csv",
//             Body: updatedData,
//             ContentType: "text/csv",
//           })
//           .promise();
//       })
//     );

//     res.json({ message: "Patient entry saved successfully!" });
//   } catch (err) {
//     console.error("Error storing patient entry:", err);
//     res.status(500).json({ error: "Failed to store entry" });
//   }
// });

// // Run locally if needed
// app.listen(5000, () => console.log("Server running on port 5000"));
