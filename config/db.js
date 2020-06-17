// Establish connect to the DB

const mongoose = require('mongoose');
const config = require('config');

// Get the DB URL from 'default.json', saved in the config folder
const db = config.get('mongoURI');

// Try and connect. Pass in options to avoid some deprecation warnings
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('MongoDB connected...');
  } catch (err) {
    // Failuer - log the error and exit
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
