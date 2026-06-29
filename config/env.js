/**
 * Validates required environment variables at startup.
 * @throws {Error} If any required variable is missing or empty.
 */
const validateEnv = () => {
  const required = ["MONGODB_URI", "JWT_SECRET", "OPENAI_API_KEY", "NEWSAPI_KEY"];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Copy .env.example to .env and fill in the values."
    );
  }
};

module.exports = validateEnv;
