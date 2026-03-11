const nodemailer = require('nodemailer');

// Verify email configuration on startup
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️  EMAIL_USER or EMAIL_PASS not configured');
  console.warn('⚠️  Email notifications will not work until configured');
  console.warn('⚠️  Set these in Render Dashboard > Environment Variables');
} else {
  console.log('📧 Email service configured (verification skipped for Render compatibility)');
}

// Create transporter with Gmail SMTP - Using port 587 for Render compatibility
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates on some platforms
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// NOTE: transporter.verify() is disabled because Render free tier blocks SMTP verification
// However, transporter.sendMail() will still work when actually sending emails
// The connection is only established when sendMail() is called, not during verification

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
    console.error('❌ Error code:', error.code);
    
    // Specific error handling
    if (error.code === 'EAUTH') {
      console.error('❌ Authentication failed - Check EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      console.error('❌ Connection timeout - Check network/firewall settings');
    } else if (error.code === 'ENETUNREACH') {
      console.error('❌ Network unreachable - Port 587 may be blocked');
    }
    
    // Return error but don't crash the server
    return { success: false, error: error.message, code: error.code };
  }
};

module.exports = { sendEmail };
