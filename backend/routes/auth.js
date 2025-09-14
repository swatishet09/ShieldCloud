

const express = require("express");
const router = express.Router();


const authController = require("../controllers/authController");

// User registration
router.post("/register", authController.register);

// User login
router.post("/login", authController.login);

// MFA verification (for doctor/patient flow)
router.post("/verify-mfa", authController.verifyMFA);

module.exports = router;
