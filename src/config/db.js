const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mode = process.env.NODE_ENV || 'prod';
    let mongo_uri;

    if (mode === 'prod') {
      mongo_uri = process.env.MONGO_URL_prod;
    } else if (mode === 'dev') {
      mongo_uri = process.env.MONGO_URL_dev;
    } else {
      mongo_uri = process.env.MONGO_URL_local || process.env.MONGO_URL_prod;
    }
    
    // Fallback if specific env vars are not set but MONGO_URI is
    if(!mongo_uri && process.env.MONGO_URI) {
        mongo_uri = process.env.MONGO_URI;
    }

    if (!mongo_uri) {
        console.error('MongoDB URI is not defined in environment variables.');
        process.exit(1);
    }

    await mongoose.connect(mongo_uri);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
