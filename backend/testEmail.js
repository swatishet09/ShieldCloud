require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function test() {
  const success = await sendEmail(
    "swatishet009@gmail.com",
    "Test MFA Code",
    "Your test code is 123456"
  );
  console.log("Email sent?", success);
}

test();
