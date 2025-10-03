



// const nodemailer = require("nodemailer");

// // Gmail transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT) || 587,
//   secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
//   pool: true,
//   maxConnections: 3,
//   maxMessages: 100,
// });

// // Verify transporter on startup
// (async () => {
//   try {
//     await transporter.verify();
//     console.log("✅ Gmail SMTP ready");
//   } catch (err) {
//     console.error("❌ Gmail SMTP connection failed", err);
//   }
// })();

// async function sendEmail(to, subject, body) {
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.FROM_EMAIL,
//       to,
//       subject,
//       text: body,
//     });
//     console.log("✅ MFA email sent:", info.messageId);
//     return true;
//   } catch (err) {
//     console.error("❌ MFA email failed:", err);
//     return false;
//   }
// }

// module.exports = { sendEmail };




// utils/sendEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true if 465, else false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
});

// Verify transporter on startup
(async () => {
  try {
    await transporter.verify();
    console.log("✅ Gmail SMTP ready");
  } catch (err) {
    console.error("❌ Gmail SMTP connection failed", err);
  }
})();

/**
 * Send an email
 * @param {string} to - recipient email
 * @param {string} subject - subject line
 * @param {string} body - plain text body
 * @returns {Promise<boolean>}
 */
async function sendEmail(to, subject, body) {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text: body,
    });
    console.log("📧 MFA email sent:", info.messageId, "to:", to);
    return true;
  } catch (err) {
    console.error("❌ MFA email failed:", err);
    return false;
  }
}

// ✅ Export correctly
module.exports = { sendEmail };
