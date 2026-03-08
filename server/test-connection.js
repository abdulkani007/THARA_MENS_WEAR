const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('Database:', mongoose.connection.name);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check if MongoDB is running: net start MongoDB');
    console.log('2. Verify connection string in .env file');
    console.log('3. Try connecting with MongoDB Compass: mongodb://localhost:27017');
    process.exit(1);
  });
