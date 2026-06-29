const getOpenAIClient = require("../config/openai");
const log = require("../config/log");

/**
 * Rewrites input text while preserving meaning using OpenAI.
 * @param {string} inputText - Text to paraphrase.
 * @returns {Promise<string>} Paraphrased text.
 */
const paraphraseContent = async (inputText) => {
  try {
    const openai = getOpenAIClient();
    log.info("Sending paraphrase request to OpenAI.", { inputLength: inputText.length });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a paraphrasing assistant. Rewrite the given text in different words while preserving the meaning.",
        },
        {
          role: "user",
          content: `Please paraphrase the following text:
            ${inputText}`,
        },
      ],
    });

    const result = response.choices[0].message.content.trim();
    log.info("Paraphrase completed successfully.", { outputLength: result.length });
    return result;
  } catch (error) {
    log.error("Error paraphrasing content.", { message: error.message, stack: error.stack });
    throw new Error("Failed to paraphrase content.");
  }
};

/**
 * Paraphrases user-submitted text. Requires authentication.
 * @param {import("express").Request} req - Express request with inputText in body.
 * @param {import("express").Response} res - Express response.
 */
exports.paraphraseController = async (req, res) => {
  const { inputText } = req.body;
  log.info("Paraphrase endpoint called.", { userId: req.user?.userId, inputLength: inputText?.length });

  if (!inputText) {
    log.warn("Paraphrase request missing input text.", { body: req.body });
    return res.status(400).json({
      error: "Input text is required for paraphrasing.",
    });
  }

  try {
    const paraphrasedText = await paraphraseContent(inputText);
    res.json({ paraphrasedText });
  } catch (error) {
    log.error("Paraphrasing request failed.", { message: error.message });
    res.status(500).json({
      error: "An error occurred during the paraphrasing process.",
    });
  }
};
