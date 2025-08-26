const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // you can use gmail, outlook, etc.
  auth: {
    user: process.env.EMAIL_USER, // put in .env
    pass: process.env.EMAIL_PASS  // put in .env (App password for Gmail)
  },
});

// function to send mail
async function sendMail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("Email error:", err);
  }
}

module.exports = sendMail;
