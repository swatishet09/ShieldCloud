


// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const { isValidIamUser } = require("../utils/iam");
// const { isEmailInS3Csv } = require("../utils/s3AllowList");
// const sendEmail = require("../utils/sendEmail");

// // REGISTER
// exports.register = async (req, res) => {
//   try {
//     const { fullName, email, username, dateOfBirth, password, confirmPassword, role } = req.body;

//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match." });
//     }

//     // Check for duplicate email/username
//     if (await User.exists({ $or: [{ email }, { username }] })) {
//       return res.status(400).json({ message: "Email or username already taken." });
//     }

//     // Admin validation via IAM
//     if (role === "admin") {
//       if (!username) {
//         return res.status(400).json({ message: "Username is required for admin." });
//       }
//       const valid = await isValidIamUser(username);
//       if (!valid) {
//         return res.status(403).json({ message: "Username is not a valid AWS IAM user." });
//       }
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await User.create({
//       fullName,
//       username: username || null,
//       email,
//       dateOfBirth,
//       password: hashedPassword,
//       role,
//     });

//     return res.status(201).json({ message: "Registration successful." });
//   } catch (err) {
//     console.error("Register Error:", err);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // LOGIN
// exports.login = async (req, res) => {
//   try { 
//     const { loginInput, password } = req.body;
//     if (!loginInput || !password) {
//       return res.status(400).json({ message: "Missing loginInput or password" });
//     }

//     const user = await User.findOne({
//       $or: [{ email: loginInput }, { username: loginInput }],
//     });

//     if (!user) return res.status(400).json({ message: "Invalid username/email or password." });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ message: "Invalid credentials." });
// console.log("SMTP settings:", process.env.SMTP_HOST, process.env.SMTP_USER)

//     // ---- Admin direct login ----
//     if (user.role === "admin") {
//       const hasIAMAccess = await isValidIamUser(user.username);
//       if (!hasIAMAccess) return res.status(403).json({ message: "AWS IAM role check failed." });

//       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
//       return res.json({ token });
//     }

//     // ---- Doctor/Patient MFA Flow ----
//     if (["doctor", "patient"].includes(user.role)) {
//       const emailFound = await isEmailInS3Csv(
//         process.env.S3_ORIGINAL_BUCKET,
//         "allowed_users.csv",
//         user.email
//       );

//       if (!emailFound) {
//         console.log(`❌ Email not in allowed_users.csv: ${user.email}`);
//         return res.status(403).json({ message: "Email not found in allowed_users.csv." });
//       }
//       console.log("Login attempt:", loginInput);

//       const code = Math.floor(100000 + Math.random() * 900000).toString();
//       user.mfaCode = code;
//       user.mfaExpiry = Date.now() + 10 * 60 * 1000; // 10 min
//       await user.save();

//       await sendEmail(user.email, "Your MFA Code", `Your verification code is: ${code}`);
//       console.log(`✅ MFA code generated for ${user.email}: ${code}`);
     

//       return res.json({ mfaRequired: true, userId: user._id });
//     }

//     // ---- Researchers Blocked ----
//     if (user.role === "researcher") {
//       return res.status(403).json({ message: "Researchers cannot log in here (use noisy data portal)." });
//     }

//     res.status(403).json({ message: "Unauthorized role." });
//   } catch (err) {
//     console.error("Login Error:", err);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // VERIFY MFA
// exports.verifyMFA = async (req, res) => {
//   try {
//     const { userId, code } = req.body;
//     if (!userId || !code) return res.status(400).json({ message: "Missing userId or code" });

//     const user = await User.findById(userId);
//     if (!user || !user.mfaCode || !user.mfaExpiry) {
//       return res.status(400).json({ message: "MFA not initiated." });
//     }

//     if (user.mfaCode !== code || Date.now() > user.mfaExpiry) {
//       return res.status(400).json({ message: "Invalid or expired MFA code." });
//     }
// console.log("Preparing to send MFA email to:", user.email);

// try {
//   await sendEmail(user.email, "Your MFA Code", `Your verification code is: ${code}`);
//   console.log("✅ MFA email successfully sent");
// } catch (err) {
//   console.error("❌ Failed to send MFA email:", err);
// }

//     // clear MFA
//     user.mfaCode = null;
//     user.mfaExpiry = null;
//     await user.save();
    

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
//     res.json({ token });
//     console.log(`[DEBUG MFA] Sending email to ${user.email} with code: ${code}`);

//   } catch (err) {
//     console.error("Verify MFA Error:", err);
//     res.status(500).json({ message: "Server error." });
//   }
// };

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
const sendEmail = require("../utils/sendEmail");

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

    // IAM validation for admin
    if (role === "admin") {
      const ok = await isValidIamUser(username);
      if (!ok) return res.status(403).json({ message: "Username is not a valid AWS IAM user." });
    }

    const hashed = await bcrypt.hash(password, 10);

    await createUser({
      // PK in Dynamo is email
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
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { loginInput, password } = req.body;
    if (!loginInput || !password) {
      return res.status(400).json({ message: "Missing loginInput or password" });
    }

    // Try find by email, then by username (UsernameIndex)
    let user = await getByEmail(loginInput);
    if (!user) user = await getByUsername(loginInput);

    if (!user) return res.status(400).json({ message: "Invalid username/email or password." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials." });

    // ---- Admin: direct login (IAM gate) ----
    if (user.role === "admin") {
      if (!user.username) return res.status(400).json({ message: "Admin missing username." });

      const hasIAM = await isValidIamUser(user.username);
      if (!hasIAM) return res.status(403).json({ message: "AWS IAM role check failed." });

      const token = jwt.sign({ id: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.json({ token });
    }

    // ---- Doctor/Patient: allow-list + MFA ----
    if (["doctor", "patient"].includes(user.role)) {
      const bucket = process.env.S3_ORIGINAL_BUCKET;
      const key = process.env.ORIGINAL_CSV_KEY || "allowed_users.csv";

      const allowed = await isEmailInS3Csv(bucket, key, user.email);
      if (!allowed) return res.status(403).json({ message: "Email not found in allowed list." });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 10 * 60 * 1000; // 10 min

      await setMFA(user.email, code, expiry);

      await sendEmail(user.email, "Your MFA Code", `Your verification code is: ${code}`);
      return res.json({ mfaRequired: true, userId: user.email });
    }

    // ---- Researcher: no MFA, limited data by your frontend rules ----
    if (user.role === "researcher") {
      const token = jwt.sign({ id: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return res.json({ token });
    }

    return res.status(403).json({ message: "Unauthorized role." });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error." });
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
