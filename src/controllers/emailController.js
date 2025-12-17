const sendEmail = require('../utils/emailService');

const sendCustomJewelryEmail = async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;
    const attachments = req.files || [];

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and message are required'
      });
    }

    // Prepare attachments for nodemailer
    const emailAttachments = attachments.map((file, index) => ({
      filename: file.originalname,
      path: file.path,
      cid: `image${index}@yami-jewels.com` // Content-ID for inline images
    }));

    // Send email to admin/business
    await sendEmail({
      from: `"${email} via" <yaamisjewels@gmail.com>`,
  to: 'yaamisjewels@gmail.com',
  replyTo: email, // ✅ CUSTOMER EMAIL HERE
  subject: `Custom Jewelry Inquiry from ${name}`,
      html: `
        <h2>Custom Jewelry Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        ${attachments.length > 0 ? `
          <div style="margin-top: 20px;">
            <h3>Reference Images:</h3>
            ${attachments.map((file, index) =>
        `<div style="margin: 10px 0;">
                <img src="cid:image${index}@yami-jewels.com" alt="${file.originalname}" style="max-width: 400px; max-height: 300px; border: 1px solid #ddd; padding: 5px;">
                <p style="margin: 5px 0; font-size: 12px; color: #666;">${file.originalname}</p>
              </div>`
      ).join('')}
          </div>
        ` : ''}
      `,
      attachments: emailAttachments
    });

    // Send confirmation email to customer
    await sendEmail({
       from: `"Yami Jewels" <yaamisjewels@gmail.com>`,
  to: email,
  subject: 'Thank you for your inquiry!',
      html: `
        <h2>Thank you for your inquiry!</h2>
        <p>Dear ${name},</p>
        <p>We have received your custom jewelry inquiry and will get back to you within 24-48 hours.</p>
        <p>Your message:</p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p>Best regards,<br>Yami Jewels Team</p>
      `
    });

    res.status(200).json({
      status: 'success',
      message: 'Custom jewelry inquiry sent successfully'
    });

  } catch (error) {
    console.error('Error sending custom jewelry email:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send email. Please try again later.'
    });
  }
};

module.exports = {
  sendCustomJewelryEmail
};
