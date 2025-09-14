
// // utils/sendEmail.js
// const nodemailer = require("nodemailer");

// // Log SMTP settings immediately
// console.log("Loaded SMTP settings:", {
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   user: process.env.SMTP_USER,
//   passSet: !!process.env.SMTP_PASS, // just to check if password exists
// });

// async function sendEmail(to, subject, text) {
//   try {
//     if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
//       console.log(`[DEV EMAIL] Missing SMTP config. Logging instead of sending.`);
//       console.log(`To: ${to} | Subject: ${subject} | Text: ${text}`);
//       return;
//     }

//     console.log("Creating transporter...");
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT) || 587,
//       secure: false, // true for 465, false for other ports
//       auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//     });

//     console.log("Sending email...");
//     await transporter.sendMail({
//       from: process.env.SMTP_USER,
//       to,
//       subject,
//       text,
//     });

//     console.log(`✅ Email successfully sent to ${to}`);
//   } catch (err) {
//     console.error("❌ SendEmail Error:", err);
//   }
// }

// module.exports = sendEmail;


const nodemailer = require("nodemailer");

async function sendEmail(to, subject, body) {
  try {
    // Create SMTP transporter (SES)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false, // TLS (587) - use true only if port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text: body,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}

module.exports = sendEmail;
