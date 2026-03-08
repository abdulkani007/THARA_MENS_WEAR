const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://username:password@cluster.mongodb.net/thara', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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
    res.json({ imageUrl: `http://localhost:5000/api/images/${image._id}` });
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

app.delete('/api/images/:id', async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log('Server on port 5000'));
