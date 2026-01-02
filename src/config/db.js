const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mode = process.env.NODE_ENV || 'prod';
    let mongo_uri;

    console.log(`[DB Config] NODE_ENV: ${mode}`);

    if (mode === 'prod') {
      mongo_uri = process.env.MONGO_URL_prod;
      console.log(`[DB Config] Checking MONGO_URL_prod: ${mongo_uri ? 'Found' : 'Not set'}`);
    } else if (mode === 'dev') {
      mongo_uri = process.env.MONGO_URL_dev;
      console.log(`[DB Config] Checking MONGO_URL_dev: ${mongo_uri ? 'Found' : 'Not set'}`);
    } else {
      mongo_uri = process.env.MONGO_URL_local || process.env.MONGO_URL_prod;
      console.log(`[DB Config] Checking MONGO_URL_local: ${process.env.MONGO_URL_local ? 'Found' : 'Not set'}`);
    }
    
    // Fallback if specific env vars are not set but MONGO_URI is
    if(!mongo_uri && process.env.MONGO_URI) {
        mongo_uri = process.env.MONGO_URI;
        console.log(`[DB Config] Using fallback MONGO_URI: Found`);
    }

    if (!mongo_uri) {
        console.error('[DB Config] ❌ MongoDB URI is not defined in environment variables.');
        console.error('[DB Config] Available env vars:', {
          NODE_ENV: process.env.NODE_ENV,
          has_MONGO_URL_prod: !!process.env.MONGO_URL_prod,
          has_MONGO_URL_dev: !!process.env.MONGO_URL_dev,
          has_MONGO_URL_local: !!process.env.MONGO_URL_local,
          has_MONGO_URI: !!process.env.MONGO_URI,
        });
        console.error('[DB Config] Please set one of: MONGO_URL_prod, MONGO_URI, or MONGO_URL_dev in Render environment variables.');
        process.exit(1);
    }

    // Safety check: Prevent connecting to localhost in production
    if (mode === 'prod' && (mongo_uri.includes('localhost') || mongo_uri.includes('127.0.0.1'))) {
        console.error('[DB Config] ❌ ERROR: Cannot use localhost MongoDB in production!');
        console.error('[DB Config] Your connection string points to localhost. Use MongoDB Atlas or a remote MongoDB instance.');
        process.exit(1);
    }

    console.log(`[DB Config] Attempting to connect to MongoDB...`);
    await mongoose.connect(mongo_uri);
    console.log(`[DB Config] ✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`[DB Config] ❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('ECONNREFUSED') || error.message.includes('localhost') || error.message.includes('127.0.0.1')) {
      console.error('[DB Config] ❌ Connection refused - likely trying to connect to localhost.');
      console.error('[DB Config] Make sure your MongoDB connection string points to a remote database (e.g., MongoDB Atlas).');
      console.error('[DB Config] Check your Render environment variables: MONGO_URL_prod or MONGO_URI');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
