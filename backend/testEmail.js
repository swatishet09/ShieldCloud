require("dotenv").config();
const nodemailer = require("nodemailer");


const sendEmail = require('./utils/sendEmail');

(async () => {
  try {
    await sendEmail('harrypet38@gmail.com', 'Test MFA', 'Your test code is 123456');
    console.log('✅ Test email function worked');
  } catch (err) {
    console.error('❌ Test email failed:', err);
  }
})();
  
async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "your_test_email@gmail.com", // replace with your email
      subject: "Test MFA Email",
      text: "This is a test email from NodeMailer.",
    });
    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
}

testEmail();
