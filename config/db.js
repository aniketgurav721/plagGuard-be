const mongoose = require("mongoose");
const log = require("./log");

/**
 * Connects the application to MongoDB.
 * @param {string} mongoUri - MongoDB connection string.
 * @returns {Promise<void>}
 */
const connectToMongoDB = async (mongoUri) => {
  try {
    log.info("Attempting MongoDB connection.", { mongoUri });
    await mongoose.connect(mongoUri);
    log.info("MongoDB connected successfully.");
  } catch (error) {
    log.error("Error connecting to MongoDB.", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

module.exports = connectToMongoDB;
