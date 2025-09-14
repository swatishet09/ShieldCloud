


const { uploadJsonToS3 } = require('../utils/s3AllowList');
const { v4: uuidv4 } = require('uuid');

// Helper to generate noisy version
function generateNoisyData(patient) {
  return {
    ...patient,
    name: 'Patient_' + Math.floor(Math.random() * 10000),
    email: 'anonymous@example.com',
    age: Math.floor(Math.random() * 100) + 1,
  };
}

const ORIGINAL_BUCKET = 'your-original-bucket-name';
const NOISY_BUCKET = 'your-noisy-bucket-name';

const createPatient = async (req, res) => {
  try {
    const patientData = req.body;
    const patientId = uuidv4();

    const originalKey = `patients/original/${patientId}.json`;
    const noisyKey = `patients/noisy/${patientId}.json`;

    const noisyData = generateNoisyData(patientData);

    await uploadJsonToS3(patientData, originalKey, ORIGINAL_BUCKET);
    await uploadJsonToS3(noisyData, noisyKey, NOISY_BUCKET);

    res.status(201).json({ message: 'Patient added and uploaded to S3 successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload patient data' });
  }
};

module.exports = { createPatient };
