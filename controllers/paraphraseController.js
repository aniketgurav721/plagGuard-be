const getOpenAIClient = require("../config/openai");

/**
 * Rewrites input text while preserving meaning using OpenAI.
 * @param {string} inputText - Text to paraphrase.
 * @returns {Promise<string>} Paraphrased text.
 */
const paraphraseContent = async (inputText) => {
  try {
    const openai = getOpenAIClient();
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

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error paraphrasing content:", error.message);
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

  if (!inputText) {
    return res.status(400).json({
      error: "Input text is required for paraphrasing.",
    });
  }

  try {
    const paraphrasedText = await paraphraseContent(inputText);
    res.json({ paraphrasedText });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred during the paraphrasing process.",
    });
  }
};
