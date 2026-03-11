const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Verify Resend API key configuration on startup
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY not configured');
  console.warn('⚠️  Email notifications will not work until configured');
  console.warn('⚠️  Set RESEND_API_KEY in Render Dashboard > Environment Variables');
  console.warn('⚠️  Get your API key from: https://resend.com/api-keys');
} else {
  console.log('📧 Email service configured with Resend API');
}

// Reusable email sending function using Resend
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
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
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

    // Send email using Resend API
    const { data, error } = await resend.emails.send({
      from: 'Thara Mens Wear <onboarding@resend.dev>',
      to: to,
      subject: subject,
      html: html
    });

    // Handle Resend API errors
    if (error) {
      console.error('❌ Email sending failed:', error.message || error);
      return { 
        success: false, 
        error: error.message || 'Failed to send email',
        details: error
      };
    }

    // Success
    console.log('✅ Email sent successfully to:', to);
    console.log('📧 Message ID:', data.id);
    
    return { 
      success: true, 
      messageId: data.id 
    };

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // Specific error handling
    if (error.message.includes('API key')) {
      console.error('❌ API key error - Check RESEND_API_KEY in environment variables');
    } else if (error.message.includes('rate limit')) {
      console.error('❌ Rate limit exceeded - Too many emails sent');
    } else if (error.message.includes('invalid')) {
      console.error('❌ Invalid email address or parameters');
    }
    
    // Return error but don't crash the server
    return { 
      success: false, 
      error: error.message 
    };
  }
};

module.exports = { sendEmail };
