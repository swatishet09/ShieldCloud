// routes/admin.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const isAuth = require('../middleware/isAuth');
const { uploadCsv } = require('../controllers/adminController');

// Only allow admin
function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only.' });
  }
  next();
}

// Memory storage: no local disk writes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max (adjust if needed)
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' || // some browsers send this for .csv
      file.originalname.toLowerCase().endsWith('.csv')
    ) {
      return cb(null, true);
    }
    cb(new Error('Only CSV files are allowed.'));
  },
});

router.post('/upload', isAuth, isAdmin, upload.single('file'), uploadCsv);

module.exports = router;
