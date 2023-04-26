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
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = { sendEmail };
