const express = require("express");
const cors = require("cors");
require("dotenv").config();

const validateEnv = require("./config/env");
const connectToMongoDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const plagiarismRoutes = require("./routes/plagiarismRoutes");
const paraphraseRoute = require("./routes/paraphraseRoute");

validateEnv();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

/**
 * Health check endpoint for load balancers and deployment probes.
 */
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "plagguard-api" });
});

connectToMongoDB(process.env.MONGODB_URI);

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/plagiarism", plagiarismRoutes);
app.use("/api/paraphrase", paraphraseRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
