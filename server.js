const express = require("express");
const cors = require("cors");
require("dotenv").config();

const log = require("./config/log");
const validateEnv = require("./config/env");
const connectToMongoDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const plagiarismRoutes = require("./routes/plagiarismRoutes");
const paraphraseRoute = require("./routes/paraphraseRoute");

validateEnv();
log.info("Environment variables validated successfully.");

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
app.use((req, _res, next) => {
  log.request(req);
  next();
});

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

app.use((err, req, res, next) => {
  log.error("Unhandled error in request pipeline", {
    path: req.originalUrl,
    method: req.method,
    error: err?.message,
    stack: err?.stack,
  });
  res.status(500).json({ error: "Internal server error." });
  next();
});

app.listen(PORT, () => {
  log.info(`Server running on port ${PORT}`, { port: PORT });
});

process.on("unhandledRejection", (reason) => {
  log.error("Unhandled promise rejection", { reason });
});

process.on("uncaughtException", (error) => {
  log.error("Uncaught exception", { message: error.message, stack: error.stack });
  process.exit(1);
});
