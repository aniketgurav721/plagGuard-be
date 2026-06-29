const { OpenAI } = require("openai");
const log = require("./log");

let openaiClient = null;

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    log.error("Missing OPENAI_API_KEY environment variable.", { hasOpenAIKey: false });
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  if (!openaiClient) {
    log.info("Creating new OpenAI client instance.", { hasOpenAIKey: true });
    openaiClient = new OpenAI({ apiKey });
  } else {
    log.debug("Reusing existing OpenAI client instance.", { hasOpenAIKey: true });
  }
  return openaiClient;
};

module.exports = getOpenAIClient;
