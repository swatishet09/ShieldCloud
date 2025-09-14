
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

exports.uploadCsv = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'CSV file is required.' });
    }

    const Bucket = process.env.S3_ORIGINAL_BUCKET;
    const Key = process.env.ORIGINAL_CSV_KEY; // <- static key from .env

    if (!Bucket || !Key) {
      return res.status(500).json({
        message: 'Missing S3_ORIGINAL_BUCKET or ORIGINAL_CSV_KEY in environment.',
      });
    }

    // Optional: light validation to ensure the CSV has an "email" header
    const firstChunk = req.file.buffer.slice(0, 2048).toString('utf-8');
    const headerLine = firstChunk.split(/\r?\n/)[0] || '';
    if (!/(^|,)\s*email\s*(,|$)/i.test(headerLine)) {
      // You can relax/remove this if your header is different
      return res.status(400).json({
        message:
          'CSV missing "email" column in header. Include a header row like: email,role,...',
      });
    }

    await s3
      .putObject({
        Bucket,
        Key,
        Body: req.file.buffer,
        ContentType: 'text/csv',
        ServerSideEncryption: 'AES256', // optional but recommended
      })
      .promise();

    return res.status(200).json({
      message: 'CSV uploaded successfully to S3 (static key).',
      bucket: Bucket,
      key: Key,
      size: req.file.size,
    });
  } catch (err) {
    console.error('uploadCsv error:', err);
    return res.status(500).json({ message: 'Upload failed.', error: err.message });
  }
};
