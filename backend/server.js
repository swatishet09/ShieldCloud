// require('dotenv').config();

// console.log("Loaded SMTP settings:", {
//   host: process.env.SMTP_HOST,
//   user: process.env.SMTP_USER,
//   passExists: !!process.env.SMTP_PASS
// });




// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');


// const app = express();

// app.use(cors());
// app.use(express.json());


// mongoose.connect(process.env.MONGO_URI)
// .then(() => console.log('MongoDB connected'))
// .catch((err) => console.error('MongoDB error:', err));

// app.get('/test-csv-key', (req, res) => {
//   const key = process.env.ORIGINAL_CSV_KEY;
//   res.json({ csvKey: key || 'No key found in env file' });
// });

// app.use('/api/auth', require('./routes/auth'));

// app.use('/api/admin', require('./routes/admin'));

// app.use("/api/data", require('./routes/data'));

// app.use('/api/patients',require('./routes/patientRoutes'));


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


require('dotenv').config();

console.log("Loaded SMTP settings:", {
  host: process.env.SMTP_HOST,
  user: process.env.SMTP_USER,
  passExists: !!process.env.SMTP_PASS
});

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ---- Routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/data', require('./routes/data'));
app.use('/api/patients', require('./routes/patientRoutes'));

// Test endpoint to confirm env setup
app.get('/test-csv-key', (req, res) => {
  const key = process.env.ORIGINAL_CSV_KEY;
  res.json({ csvKey: key || 'No key found in env file' });
});

// ---- Start Server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
