const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: options.from || `"Yami Jewels" <${process.env.EMAIL_FROM}>`,
    to: options.to,
    replyTo: options.replyTo, // ✅ IMPORTANT
    subject: options.subject,
    html: options.html,
    attachments: options.attachments || []
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
