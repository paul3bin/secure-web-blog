const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

async function sendEmail(to, subject, text) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: to, // Change to your recipient
    from: process.env.SENDGRID_VERIFIED_SENDER, // Change to your verified sender
    subject: subject,
    text: text,
    html: `<strong>${text}</strong>`,
  };
  await sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
}

async function sendOTP(to, otp, email_type) {
  sendEmail(
    to,
    "Login one time passcode",
    `Your ${email_type} one time passcode is  ${otp} . It will expire in 5 minutes.`
  );
}

module.exports = { sendEmail, sendOTP };
