const nodemailer = require('nodemailer');

// Verify email configuration on startup
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️  EMAIL_USER or EMAIL_PASS not configured in .env file');
  console.warn('⚠️  Email notifications will not work until configured');
}

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message);
  } else {
    console.log('✅ Email service is ready to send emails');
  }
});

// Reusable email sending function
const sendEmail = async (to, subject, message) => {
  try {
    const mailOptions = {
      from: `"Thara Men's Wear" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0B0C10; padding: 20px; text-align: center;">
            <h1 style="color: #FF2E2E; margin: 0;">THARA Men's Wear</h1>
          </div>
          <div style="background-color: #111111; padding: 30px; color: #C5C6C7;">
            ${message}
          </div>
          <div style="background-color: #0B0C10; padding: 15px; text-align: center; color: #66FCF1; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Thara Men's Wear. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    console.log('📧 Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    if (error.code === 'EAUTH') {
      console.error('❌ Authentication failed - Check EMAIL_USER and EMAIL_PASS in .env');
    }
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
