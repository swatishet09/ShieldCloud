const mongoose = require('mongoose');


const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true }, // auto-generate in backend
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true }, // we won’t enforce unique, since it’s CSV
  address: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  bloodGroup: { type: String },
  ethnicity: { type: String },
  religion: { type: String },
  drug: { type: String },
  firstCareUnit: { type: String },
  lastCareUnit: { type: String },
  healthIssue: { type: String },
  diagnosis: { type: String },
  allergies: { type: String },
  medications: { type: String },
  notes: { type: String },
  doctorName: { type: String },
  doctorEmail: { type: String },
  createdAt: { type: Date, default: Date.now } // auto-generated timestamp
});

module.exports = patientSchema;



