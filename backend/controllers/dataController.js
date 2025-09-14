// controllers/dataController.js
const PatientRecord = require('../models/PatientRecord');

exports.addManualEntry = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can add patient records.' });
    }

    const data = req.body;

    const newRecord = await PatientRecord.create(data);

    res.status(201).json({
      message: 'Patient record added successfully.',
      record: newRecord
    });
  } catch (error) {
    console.error('Error in addManualEntry:', error);
    res.status(500).json({
      message: 'Server error while adding patient.',
      error: error.toString()
    });
  }
};
