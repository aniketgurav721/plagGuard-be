const mongoose = require("mongoose");

/**
 * Connects the application to MongoDB.
 * @param {string} mongoUri - MongoDB connection string.
 * @returns {Promise<void>}
 */
const connectToMongoDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectToMongoDB;
