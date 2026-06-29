const { OpenAI } = require("openai");

let openaiClient = null;

/**
 * Returns a singleton OpenAI client instance.
 * Lazily initialized on first use after env validation.
 * @returns {import("openai").OpenAI}
 */
const getOpenAIClient = () => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY.trim(),
    });
  }
  return openaiClient;
};

module.exports = getOpenAIClient;
