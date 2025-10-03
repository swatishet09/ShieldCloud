const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  getByEmail,
  getByUsername,
  createUser,
  setMFA,
  clearMFA,
  existsByEmailOrUsername,
} = require("../models/User");

const { isValidIamUser } = require("../utils/iam");
const { isEmailInS3Csv } = require("../utils/s3AllowList");
const {sendEmail}= require("../utils/sendEmail");
console.log("sendEmail typeof =", typeof sendEmail);

// REGISTER
exports.register = async (req, res) => {
  try {
    const { fullName, email, username, dateOfBirth, password, confirmPassword, role } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Admins must provide username (for IAM validation)
    if (role === "admin" && !username) {
      return res.status(400).json({ message: "Username is required for admin." });
    }

    // Duplicate check (email and, if present, username)
    const taken = await existsByEmailOrUsername(email, username);
    if (taken) {
      return res.status(400).json({ message: "Email or username already taken." });
    }


    const hashed = await bcrypt.hash(password, 10);

    await createUser({
      email,
      // username is optional (present for admin, can be null for patient/doctor)
      username: username || null,
      fullName,
      dateOfBirth: new Date(dateOfBirth).toISOString().split("T")[0], // store as YYYY-MM-DD
      password: hashed,
      role,
      // mfa fields omitted until needed
    });
   

    return res.status(201).json({ message: "Registration successful." });
  } catch (err) {
     console.error("Register Error:", JSON.stringify(err, null, 2)); // detailed logging
  res.status(500).json({ 
    message: "Server error", 
    error: err.message 
  });
  }
};



exports.login = async (req, res) => {
  try {
    const { loginInput, password } = req.body;
    if (!loginInput || !password) {
      return res.status(400).json({ message: "Missing loginInput or password" });
    }

    // Try find by email, then by username (UsernameIndex)
    let user = await getByEmail(loginInput);
    if (!user) user = await getByUsername(loginInput);

    if (!user) {
      return res.status(400).json({ message: "Invalid username/email or password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // ---------------- Admin flow ----------------
    if (user.role === "admin") {
      // Admin must log in with username (not email)
      if (loginInput.includes("@")) {
        return res.status(400).json({ message: "Admins must log in with username, not email." });
      }

      if (!user.username) {
        return res.status(400).json({ message: "Admin missing username." });
      }

      const hasIAM = await isValidIamUser(user.username);
      if (!hasIAM) {
        return res.status(403).json({ message: "AWS IAM role check failed." });
      }

      const token = jwt.sign(
        { id: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.json({ token });
    }

  // ---- Doctor/Patient: allow-list + MFA ----
if (["doctor", "patient"].includes(user.role)) {
  const bucket = process.env.S3_ORIGINAL_BUCKET;
  const key = process.env.ORIGINAL_CSV_KEY || "allowed_users.csv";

  // Check if email exists in S3 allow-list
  const allowed = await isEmailInS3Csv(bucket, key, user.email);
  if (!allowed) {
    return res.status(403).json({ message: "Email not found in allowed list." });
  }

  // Generate MFA code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  await setMFA(user.email, code, expiry);

  // Send MFA code using SES in fire-and-forget mode
  sendEmail(user.email, "Your MFA Code", `Your verification code is: ${code}`)
    .then(() => console.log(`MFA email sent to ${user.email}`))
    .catch(err => console.error(`Failed to send MFA email to ${user.email}:`, err));

  // Immediately respond to the client
  return res.json({ mfaRequired: true, userId: user.email });
}
    
     if (user.role === "researcher") {
      const token = jwt.sign({ id: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.json({ token });
    }

    // ---------------- Fallback ----------------
    return res.status(400).json({ message: "Unsupported role." });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// VERIFY MFA
exports.verifyMFA = async (req, res) => {
  try {
    const { userId, code } = req.body; // userId is the email we returned earlier
    if (!userId || !code) return res.status(400).json({ message: "Missing userId or code" });

    const user = await getByEmail(userId);
    if (!user || !user.mfaCode || !user.mfaExpiry) {
      return res.status(400).json({ message: "MFA not initiated." });
    }

    if (user.mfaCode !== code || Date.now() > user.mfaExpiry) {
      return res.status(400).json({ message: "Invalid or expired MFA code." });
    }

    await clearMFA(user.email);

    const token = jwt.sign({ id: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token });
  } catch (err) {
    console.error("Verify MFA Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};





// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const {
//   getByEmail,
//   getByUsername,
//   createUser,
//   setMFA,
//   clearMFA,
//   existsByEmailOrUsername,
// } = require("../models/User");

// const { isValidIamUser } = require("../utils/iam");
// const { isEmailInS3Csv } = require("../utils/s3AllowList");
// const { sendEmail } = require("../utils/sendEmail");

// // ---------------- REGISTER ----------------
// exports.register = async (req, res) => {
//   try {
//     const { fullName, email, username, dateOfBirth, password, confirmPassword, role } = req.body;

//     if (!fullName || !email || !password || !confirmPassword || !role) {
//       return res.status(400).json({ message: "Missing required fields." });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match." });
//     }

//     if (role === "admin" && !username) {
//       return res.status(400).json({ message: "Username is required for admin." });
//     }

//     const taken = await existsByEmailOrUsername(email, username);
//     if (taken) {
//       return res.status(400).json({ message: "Email or username already taken." });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     await createUser({
//       email,
//       username: username || null,
//       fullName,
//       dateOfBirth: new Date(dateOfBirth).toISOString().split("T")[0],
//       password: hashed,
//       role,
//     });

//     return res.status(201).json({ message: "Registration successful." });
//   } catch (err) {
//     console.error("Register Error:", JSON.stringify(err, null, 2));
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // ---------------- LOGIN ----------------
// exports.login = async (req, res) => {
//   try {
//     const { loginInput, password } = req.body;
//     if (!loginInput || !password) {
//       return res.status(400).json({ message: "Missing loginInput or password" });
//     }

//     let user = await getByEmail(loginInput);
//     if (!user) user = await getByUsername(loginInput);
//     if (!user) return res.status(400).json({ message: "Invalid username/email or password." });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ message: "Invalid credentials." });

//     // ---------------- Admin flow ----------------
//     if (user.role === "admin") {
//       if (loginInput.includes("@")) {
//         return res.status(400).json({ message: "Admins must log in with username, not email." });
//       }

//       if (!user.username) return res.status(400).json({ message: "Admin missing username." });

//       const hasIAM = await isValidIamUser(user.username);
//       if (!hasIAM) return res.status(403).json({ message: "AWS IAM role check failed." });

//       const token = jwt.sign({ id: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
//       return res.json({ token });
//     }

//     // ---------------- Doctor/Patient flow with MFA ----------------
//     if (["doctor", "patient"].includes(user.role)) {
//       const bucket = process.env.S3_ORIGINAL_BUCKET;
//       const key = process.env.ORIGINAL_CSV_KEY || "allowed_users.csv";

//       const allowed = await isEmailInS3Csv(bucket, key, user.email);
//       if (!allowed) return res.status(403).json({ message: "Email not found in allowed list." });

//       const code = Math.floor(100000 + Math.random() * 900000).toString();
//       const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

//       await setMFA(user.email, code, expiry);

//       sendEmail(user.email, "Your MFA Code", `Your verification code is: ${code}`)
//         .then(() => console.log(`MFA email sent to ${user.email}`))
//         .catch(err => console.error(`Failed to send MFA email to ${user.email}:`, err));

//       return res.json({ mfaRequired: true, userId: user.email });
//     }

//     // ---------------- Researcher flow ----------------
//     if (user.role === "researcher") {
//       const token = jwt.sign({ id: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
//       return res.json({ token });
//     }

//     return res.status(400).json({ message: "Unsupported role." });

//   } catch (err) {
//     console.error("Login error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };




// // ---------------- VERIFY MFA ----------------
// exports.verifyMFA = async (req, res) => {
//   try {
//     const { userId, code } = req.body;
//     if (!userId || !code) return res.status(400).json({ message: "Missing userId or code" });

//     const user = await getByEmail(userId);
//     if (!user || !user.mfaCode || !user.mfaExpiry) {
//       return res.status(400).json({ message: "MFA not initiated." });
//     }

//     if (user.mfaCode !== code || Date.now() > user.mfaExpiry) {
//       return res.status(400).json({ message: "Invalid or expired MFA code." });
//     }

//     await clearMFA(user.email);

//     const token = jwt.sign({ id: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
//     return res.json({ token });
//   } catch (err) {
//     console.error("Verify MFA Error:", err);
//     res.status(500).json({ message: "Server error." });
//   }
// };
