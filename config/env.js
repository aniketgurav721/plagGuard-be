/**
 * Validates required environment variables at startup.
 * @throws {Error} If any required variable is missing or empty.
 */
const log = require("./log");

const validateEnv = () => {
  const required = ["MONGODB_URI", "JWT_SECRET", "OPENAI_API_KEY", "NEWSAPI_KEY"];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    log.error("Missing required environment variables", { missing });
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Copy .env.example to .env and fill in the values."
    );
  }

  log.info("All required environment variables are set.");
};

module.exports = validateEnv;
