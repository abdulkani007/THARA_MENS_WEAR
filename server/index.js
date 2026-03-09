const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const Image = require('./models/Image');

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
