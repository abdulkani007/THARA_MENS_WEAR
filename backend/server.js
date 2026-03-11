const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('📧 Email service configured with SendGrid API');
} else {
  console.warn('⚠️  SENDGRID_API_KEY not configured');
}

// CORS Configuration - Allow frontend access
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const imageSchema = new mongoose.Schema({
  productId: String,
  filename: String,
  data: String,
  contentType: String,
  createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.model('Image', imageSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Test Route
app.get('/', (req, res) => {
  res.send('THARA backend running');
});

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    const base64 = req.file.buffer.toString('base64');
    const image = new Image({
      productId: req.body.productId,
      filename: req.file.originalname,
      data: base64,
      contentType: req.file.mimetype
    });
    await image.save();
    const baseUrl = process.env.BASE_URL || 'https://thara-mens-wear.onrender.com';
    res.json({ imageUrl: `${baseUrl}/api/images/${image._id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/images/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).send('Not found');
    const buffer = Buffer.from(image.data, 'base64');
    res.set('Content-Type', image.contentType);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find().select('-data').sort({ createdAt: -1 });
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/images/:id', async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email sending function
const sendEmail = async (to, subject, message) => {
  try {
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('SendGrid not configured');
    }

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

    const msg = {
      to: to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: subject,
      html: html
    };

    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully to:', to);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const subject = 'Test Email - Thara Men\'s Wear';
    const message = `
      <h2 style="color: #FF2E2E;">Test Email</h2>
      <p style="font-size: 16px;">This is a test email from Thara Men's Wear backend.</p>
      <p style="font-size: 16px;">If you received this, your email configuration is working correctly! ✅</p>
    `;

    const result = await sendEmail(email, subject, message);
    if (result.success) {
      res.json({ success: true, message: 'Test email sent successfully!' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Registration email endpoint
app.post('/api/send-registration-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const subject = 'Welcome to Thara Men\'s Wear';
    const message = `
      <h2 style="color: #FF2E2E;">Welcome ${name || 'Valued Customer'}!</h2>
      <p style="font-size: 16px;">Your account has been successfully created.</p>
      <p style="font-size: 16px;">Thank you for joining Thara Men's Wear!</p>
    `;

    const result = await sendEmail(email, subject, message);
    if (result.success) {
      res.json({ success: true, message: 'Registration email sent' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Order email endpoint
app.post('/api/send-order-email', async (req, res) => {
  try {
    const { email, orderId, orderTotal, items } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const itemsList = items?.map(item => `<li>${item.name} - Quantity: ${item.quantity}</li>`).join('') || '';
    const subject = 'Order Confirmation - Thara Men\'s Wear';
    const message = `
      <h2 style="color: #FF2E2E;">Order Confirmed!</h2>
      <p style="font-size: 16px;">Your order has been placed successfully.</p>
      ${orderId ? `<p><strong>Order ID:</strong> ${orderId}</p>` : ''}
      ${orderTotal ? `<p><strong>Total:</strong> ₹${orderTotal}</p>` : ''}
      ${itemsList ? `<h3 style="color: #66FCF1;">Items:</h3><ul>${itemsList}</ul>` : ''}
      <p>Thank you for shopping with us!</p>
    `;

    const result = await sendEmail(email, subject, message);
    if (result.success) {
      res.json({ success: true, message: 'Order email sent' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
