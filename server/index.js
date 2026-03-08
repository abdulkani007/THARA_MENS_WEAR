const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const Image = require('./models/Image');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const productId = req.body.productId || Date.now().toString();
    const base64Image = req.file.buffer.toString('base64');

    const image = new Image({
      productId,
      imageData: base64Image,
      contentType: req.file.mimetype
    });

    await image.save();

    const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
