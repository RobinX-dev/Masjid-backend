const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

const connectdb = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  };
  
  module.exports = connectdb;