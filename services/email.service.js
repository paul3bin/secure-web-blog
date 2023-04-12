const sendgrid = require("@sendgrid/mail");

const SENDGRID_API_KEY =
  "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";

sendgrid.setApiKey(SENDGRID_API_KEY);

async function sendEmail(to, subject, text) {
  const msg = {
    to: "bhaskerr@gmail.com",
    // Change to your recipient
    from: "kvq22xwu@uea.ac.uk",
    // Change to your verified sender
    subject: subject,
    text: text,
  };
  sendgrid
    .send(msg)
    .then((resp) => {
      //console.log("Email sent\n", resp);
    })
    .catch((error) => {
      //console.error(error);
    });
}

module.exports = { sendEmail };
