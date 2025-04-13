require('dotenv').config();
const mongoose = require('mongoose');

console.log('Attempting to connect to MongoDB...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }); 