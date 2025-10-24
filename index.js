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
//     const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
//     const { type, fileContent, record } = body;

//     // ✅ Always target mimic.csv
//     const targetFile = "PatientsDetails.csv";

//     if (type === "file") {
//       if (!fileContent) {
//         return { 
//           statusCode: 400, 
//           headers: { "Access-Control-Allow-Origin": "*" }, 
//           body: JSON.stringify({ error: "fileContent required" }) 
//         };
//       }

//       const buffer = Buffer.from(fileContent, "base64");
//       const csvText = buffer.toString("utf-8");
//       const newRecords = parse(csvText, { columns: true, skip_empty_lines: true });

//       // Fetch existing records
//       const origRecords = await fetchCSV(ORIGINAL_BUCKET, targetFile);
//       const noisyRecords = await fetchCSV(NOISY_BUCKET, targetFile);

//       // Merge
//       origRecords.push(...newRecords);
//       noisyRecords.push(...newRecords.map(r => applyNoiseSensitive(r)));

//       // Save back
//       const origCsv = stringify(origRecords, { header: true });
//       const noisyCsv = stringify(noisyRecords, { header: true });

//       await uploadStringToS3(ORIGINAL_BUCKET, targetFile, origCsv);
//       await uploadStringToS3(NOISY_BUCKET, targetFile, noisyCsv);

//       return {
//         statusCode: 200,
//         headers: { "Access-Control-Allow-Origin": "*" },
//         body: JSON.stringify({ message: "CSV merged into PatientsDetails.csv in both buckets" }),
//       };
//     }

//     else if (type === "manual") {
//       if (!record || typeof record !== "object") {
//         return { 
//           statusCode: 400, 
//           headers: { "Access-Control-Allow-Origin": "*" }, 
//           body: JSON.stringify({ error: "record object required" }) 
//         };
//       }

//       const origRecords = await fetchCSV(ORIGINAL_BUCKET, targetFile);
//       const noisyRecords = await fetchCSV(NOISY_BUCKET, targetFile);

//       origRecords.push(record);
//       noisyRecords.push(applyNoiseSensitive(record));

//       const origCsv = stringify(origRecords, { header: true });
//       const noisyCsv = stringify(noisyRecords, { header: true });

//       await uploadStringToS3(ORIGINAL_BUCKET, targetFile, origCsv);
//       await uploadStringToS3(NOISY_BUCKET, targetFile, noisyCsv);

//       return { 
//         statusCode: 200, 
//         headers: { "Access-Control-Allow-Origin": "*" }, 
//         body: JSON.stringify({ message: "Manual entry appended to PatientDetails.csv in both buckets" }) 
//       };
//     }

//     return { 
//       statusCode: 400, 
//       headers: { "Access-Control-Allow-Origin": "*" }, 
//       body: JSON.stringify({ error: "Invalid type (must be 'file' or 'manual')" }) 
//     };

//   } catch (err) {
//     console.error("storeHandler error:", err);
//     return { 
//       statusCode: 500, 
//       headers: { "Access-Control-Allow-Origin": "*" }, 
//       body: JSON.stringify({ error: err.message }) 
//     };
//   }
// };





const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

const REGION = process.env.REGION || "ap-south-1";
const ORIGINAL_BUCKET = process.env.ORIGINAL_BUCKET; // e.g. "mimic-original-data"
const NOISY_BUCKET = process.env.NOISY_BUCKET;       // e.g. "mimic-noisy-data"

const s3 = new S3Client({ region: REGION });

// --- Sensitive attributes to obfuscate
const SENSITIVE = [
  "firstName", "lastName", "phone", "address", "email", "ethnicity",
  "doctorName", "doctorEmail"
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

function obfuscateName() { return `Anon_${rand(9000)+1000}`; }
function obfuscateAddress() { return `Hidden Address #${rand(200)}`; }
function obfuscateEthnicity() { return `Generalized_${rand(10)}`; }

function applyNoiseSensitive(record) {
  const noisy = { ...record };
  for (const k of SENSITIVE) {
    if (noisy[k] == null) continue;
    const val = String(noisy[k]);
    if (k === "phone") noisy[k] = obfuscatePhone(val);
    else if (k === "email" || k === "doctorEmail") noisy[k] = obfuscateEmail(val);
    else if (["firstName","lastName","doctorName"].includes(k)) noisy[k] = obfuscateName();
    else if (k === "address") noisy[k] = obfuscateAddress();
    else if (k === "ethnicity") noisy[k] = obfuscateEthnicity();
    else noisy[k] = `Obfuscated_${rand(1000)}`;
  }
  return noisy;
}

// --- Helpers
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
    return parse(body, { columns: true, skip_empty_lines: true });
  } catch (err) {
    return [];
  }
}

async function uploadStringToS3(bucket, key, bodyStr, contentType = "text/csv") {
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, Body: bodyStr, ContentType: contentType });
  await s3.send(cmd);
}

// --- Lambda handler
exports.handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { type, fileContent, record, fileName } = body;

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

      // Use timestamp for unique S3 filename
      const timeStamp = new Date().toISOString().replace(/[:.]/g, "-");
      const ext = fileName?.split(".").pop() || "csv";
      const key = `uploads/${timeStamp}_${fileName || 'file.' + ext}`;

      await uploadStringToS3(ORIGINAL_BUCKET, key, buffer, "application/octet-stream");

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: `File uploaded as ${key}` }),
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

      await uploadStringToS3(ORIGINAL_BUCKET, targetFile, stringify(origRecords, { header: true }));
      await uploadStringToS3(NOISY_BUCKET, targetFile, stringify(noisyRecords, { header: true }));

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Manual entry appended to PatientsDetails.csv in both buckets" }),
      };
    }

    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Invalid type (must be 'file' or 'manual')" }),
    };

  } catch (err) {
    console.error("Lambda error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
