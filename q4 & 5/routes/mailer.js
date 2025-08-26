const nodemailer = require("nodemailer");

// Uses Ethereal (fake SMTP) – great for demos.
// It prints a preview URL in console.
async function sendWelcomeEmail({ to, name, empId, tempPassword }) {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  const info = await transporter.sendMail({
    from: 'ERP Admin <no-reply@erp.local>',
    to,
    subject: `Welcome to the company, ${name}!`,
    html: `
      <h3>Hi ${name},</h3>
      <p>Your employee account has been created.</p>
      <ul>
        <li><b>Employee ID:</b> ${empId}</li>
        <li><b>Temporary Password:</b> ${tempPassword}</li>
        <li>Please log in and change it as soon as possible.</li>
      </ul>
      <p>— ERP Admin</p>
    `
  });

  console.log("  Message sent: %s", info.messageId);
  console.log(" Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = { sendWelcomeEmail };