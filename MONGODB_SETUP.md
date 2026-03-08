# MongoDB Setup Guide

## Why MongoDB?

Images are stored in MongoDB instead of Firebase Storage to avoid Firebase Storage costs. This is a 100% free solution.

## Option 1: Local MongoDB Installation

### Windows

1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. MongoDB will run on `mongodb://localhost:27017`

### macOS

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux

```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## Option 2: MongoDB Compass (Recommended)

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Install and open
3. Connect to: `mongodb://localhost:27017`
4. Create database: `thara`

## Backend Setup

1. **Navigate to server directory**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**

Create `server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/thara
PORT=5000
```

4. **Start the server**
```bash
npm start
```

Server will run on `http://localhost:5000`

## How It Works

### Image Upload Flow

1. User uploads image in admin panel
2. Image is converted to Base64
3. Sent to MongoDB backend via POST `/api/upload-image`
4. MongoDB stores image with productId
5. Returns image URL: `http://localhost:5000/api/images/{id}`
6. URL is stored in Firestore product document

### API Endpoints

- **POST** `/api/upload-image` - Upload image
- **GET** `/api/images/:id` - Get image
- **DELETE** `/api/images/:id` - Delete image
- **DELETE** `/api/images/product/:productId` - Delete all product images

## MongoDB Schema

```javascript
{
  productId: String,
  imageData: String,  // Base64 encoded
  contentType: String,
  createdAt: Date
}
```

## Troubleshooting

**Cannot connect to MongoDB:**
- Check if MongoDB is running
- Verify connection string in `.env`
- Try: `mongodb://127.0.0.1:27017/thara`

**Server not starting:**
- Check if port 5000 is available
- Run: `npm install` in server directory
- Check `.env` file exists

**Images not uploading:**
- Ensure backend server is running
- Check browser console for errors
- Verify MongoDB connection

## Production Deployment

For production, use MongoDB Atlas (free tier):

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `server/.env` with Atlas connection string
5. Deploy backend to Heroku/Vercel/Railway

---

✅ MongoDB setup complete! Images will now be stored locally.
