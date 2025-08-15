const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

router.post("/send-newsletter", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Yaami Jewels Newsletter" <${process.env.SMTP_USER}>`,
      to: "info@yaamijewels.com", // your receiving email
      subject: "New Newsletter Subscription",
      text: `A new user subscribed to your newsletter: ${email}`,
    });

    res.status(200).json({ message: "Subscription email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

module.exports = router;
