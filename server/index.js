const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const Image = require('./models/Image');
const LoginStats = require('./models/LoginStats');
const { sendEmail } = require('./services/emailService');

const app = express();

// CORS Configuration - Allow all origins for deployed frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('THARA backend running');
});

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const productId = req.body.productId || Date.now().toString();
    const productName = req.body.productName || 'Untitled Product';
    const fileName = req.body.fileName || req.file.originalname || 'image.jpg';
    const base64Image = req.file.buffer.toString('base64');

    const image = new Image({
      productId,
      productName,
      fileName,
      imageData: base64Image,
      contentType: req.file.mimetype
    });

    await image.save();

    const baseUrl = process.env.BASE_URL || 'https://thara-mens-wear.onrender.com';

    res.json({
      success: true,
      imageUrl: `${baseUrl}/api/images/${image._id}`,
      imageId: image._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/images/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imgBuffer = Buffer.from(image.imageData, 'base64');
    res.set('Content-Type', image.contentType);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(imgBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/images/:id', async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/images/product/:productId', async (req, res) => {
  try {
    const result = await Image.deleteMany({ productId: req.params.productId });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find()
      .select('productId productName fileName contentType createdAt')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email notification endpoint for user registration
app.post('/api/send-registration-email', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const subject = 'Welcome to Thara Men\'s Wear';
    const message = `
      <h2 style="color: #FF2E2E;">Welcome ${name || 'Valued Customer'}!</h2>
      <p style="font-size: 16px; line-height: 1.6;">
        Your account has been successfully created.
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        Thank you for joining Thara Men's Wear. We're excited to have you with us!
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        Start exploring our premium collection of men's fashion.
      </p>
    `;

    const result = await sendEmail(email, subject, message);

    if (result.success) {
      res.json({ success: true, message: 'Registration email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Registration email error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test email endpoint - for testing email functionality
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const subject = 'Test Email - Thara Men\'s Wear';
    const message = `
      <h2 style="color: #FF2E2E;">Test Email</h2>
      <p style="font-size: 16px; line-height: 1.6;">
        This is a test email from Thara Men's Wear backend.
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        If you received this, your email configuration is working correctly! ✅
      </p>
      <p style="font-size: 14px; color: #66FCF1;">
        Sent at: ${new Date().toLocaleString()}
      </p>
    `;

    console.log('🔄 Attempting to send test email to:', email);
    const result = await sendEmail(email, subject, message);

    if (result.success) {
      console.log('✅ Test email sent successfully!');
      res.json({ 
        success: true, 
        message: 'Test email sent successfully! Check your inbox.',
        messageId: result.messageId,
        sentTo: email
      });
    } else {
      console.error('❌ Test email failed:', result.error);
      res.status(500).json({ 
        success: false, 
        error: result.error,
        hint: 'Check server console for detailed error logs'
      });
    }
  } catch (error) {
    console.error('❌ Test email error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login stats endpoints
app.post('/api/admin/track-login', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let stats = await LoginStats.findOne({ date: today });
    
    if (stats) {
      stats.count += 1;
      await stats.save();
    } else {
      stats = new LoginStats({ date: today, count: 1 });
      await stats.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/login-stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStats = await LoginStats.findOne({ date: today });
    const yesterdayStats = await LoginStats.findOne({ date: yesterday });

    res.json({
      todayLogins: todayStats?.count || 0,
      yesterdayLogins: yesterdayStats?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/login-stats/weekly', async (req, res) => {
  try {
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const stats = await LoginStats.findOne({ date });
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: stats?.count || 0
      });
    }

    res.json({ data: last7Days });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email notification endpoint for order placement
app.post('/api/send-order-email', async (req, res) => {
  try {
    const { email, orderId, orderTotal, items } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const subject = 'Order Confirmation - Thara Men\'s Wear';
    const itemsList = items && items.length > 0 
      ? items.map(item => `<li>${item.name || 'Product'} - Quantity: ${item.quantity || 1}</li>`).join('')
      : '<li>Your order items</li>';

    const message = `
      <h2 style="color: #FF2E2E;">Order Confirmed!</h2>
      <p style="font-size: 16px; line-height: 1.6;">
        Your order has been placed successfully.
      </p>
      ${orderId ? `<p style="font-size: 16px;"><strong>Order ID:</strong> ${orderId}</p>` : ''}
      ${orderTotal ? `<p style="font-size: 16px;"><strong>Total Amount:</strong> ₹${orderTotal}</p>` : ''}
      ${items && items.length > 0 ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #66FCF1;">Order Items:</h3>
          <ul style="font-size: 14px; line-height: 1.8;">
            ${itemsList}
          </ul>
        </div>
      ` : ''}
      <p style="font-size: 16px; line-height: 1.6;">
        We'll notify you once your order is shipped.
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        Thank you for shopping with Thara Men's Wear!
      </p>
    `;

    const result = await sendEmail(email, subject, message);

    if (result.success) {
      res.json({ success: true, message: 'Order confirmation email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Order email error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
