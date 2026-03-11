const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('📧 Email service configured with SendGrid API');
} else {
  console.warn('⚠️  SENDGRID_API_KEY not configured');
  console.warn('⚠️  Email notifications will not work until configured');
  console.warn('⚠️  Set SENDGRID_API_KEY in Render Dashboard > Environment Variables');
  console.warn('⚠️  Get your API key from: https://app.sendgrid.com/settings/api_keys');
}

// Reusable email sending function using SendGrid
const sendEmail = async (to, subject, message) => {
  try {
    // Validate inputs
    if (!to) {
      throw new Error('Recipient email address is required');
    }
    if (!subject) {
      throw new Error('Email subject is required');
    }
    if (!message) {
      throw new Error('Email message is required');
    }

    // Check if API key is configured
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }

    // Check if sender email is configured
    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('SENDGRID_FROM_EMAIL is not configured');
    }

    // Wrap message in THARA branded template
    const html = `
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
    `;

    // Prepare email message
    const msg = {
      to: to,
      from: process.env.SENDGRID_FROM_EMAIL, // Use verified sender email
      subject: subject,
      html: html
    };

    // Send email using SendGrid
    const response = await sgMail.send(msg);

    // Success
    console.log('✅ Email sent successfully to:', to);
    console.log('📧 Response status:', response[0].statusCode);
    
    return { 
      success: true, 
      messageId: response[0].headers['x-message-id'] || 'sent'
    };

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // SendGrid specific error handling
    if (error.response) {
      console.error('❌ SendGrid error code:', error.code);
      console.error('❌ SendGrid error body:', error.response.body);
    }
    
    // Specific error handling
    if (error.message.includes('API key')) {
      console.error('❌ API key error - Check SENDGRID_API_KEY in environment variables');
    } else if (error.message.includes('from email')) {
      console.error('❌ From email error - Check SENDGRID_FROM_EMAIL in environment variables');
    } else if (error.code === 403) {
      console.error('❌ Authentication failed - Check your SendGrid API key');
    } else if (error.code === 429) {
      console.error('❌ Rate limit exceeded - Too many emails sent');
    } else if (error.code === 400) {
      console.error('❌ Bad request - Check email address format');
    }
    
    // Return error but don't crash the server
    return { 
      success: false, 
      error: error.message,
      code: error.code
    };
  }
};

module.exports = { sendEmail };
