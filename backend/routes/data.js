// routes/data.js
const express = require('express');
const router = express.Router();

const { addManualEntry } = require('../controllers/dataController');
const authenticate = require('../middleware/authMiddleware'); // Make sure this is correct!

router.post('/add-manual-entry', authenticate, addManualEntry);

module.exports = router;
