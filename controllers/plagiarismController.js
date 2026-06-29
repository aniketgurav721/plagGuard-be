const getOpenAIClient = require("../config/openai");

/**
 * Compares user text against fetched articles using OpenAI and returns similarity metrics.
 * @param {string} inputContent - Text submitted by the user.
 * @param {string} allArticlesContent - Combined content from reference articles.
 * @returns {Promise<{similarityPercentage: number, matched_text: string, highlightedTextFromIp: string}>}
 */
const compareContentSimilarity = async (inputContent, allArticlesContent) => {
  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for text matching. Compare the two provided texts and calculate the overall similarity percentage by identifying the matching words and phrases. Return only the similarity percentage and the matched sections from Text 1 (do not include other information).",
        },
        {
          role: "user",
          content: `
              Text 1:
              ${inputContent}

              Text 2:
              ${allArticlesContent}

              Please provide the similarity percentage and highlight the matched sections in Text 1 only.
            `,
        },
      ],
    });

    const similarityResponse = response.choices[0].message.content;

    const similarityPercentageMatch = similarityResponse.match(
      /Similarity Percentage: \s*[:=]?\s*(\d+(\.\d+)?)/i
    );
    const matchedText1 = similarityResponse.match(
      /Matched sections from Text 1:\s*[:=]?\s*([\s\S]+?)(?=\n|$)/i
    );

    const similarityPercentage = similarityPercentageMatch
      ? parseFloat(similarityPercentageMatch[1])
      : 0;

    const highlightedText1 = matchedText1 ? matchedText1[1].trim() : "";

    let finalContent = inputContent;
    if (highlightedText1) {
      const regex = new RegExp(`(${highlightedText1})`, "gi");
      finalContent = inputContent.replace(regex, (match) => `${match}`);
    }

    return {
      similarityPercentage,
      matched_text: highlightedText1,
      highlightedTextFromIp: finalContent,
    };
  } catch (error) {
    console.error("Error comparing contents:", error.message);
    throw new Error("Failed to compare contents.");
  }
};

/**
 * Runs a batch plagiarism check against multiple articles.
 * @param {import("express").Request} req - Express request with targetContent and articles in body.
 * @param {import("express").Response} res - Express response.
 */
exports.checkPlagiarism = async (req, res) => {
  const { targetContent, articles } = req.body;

  if (!targetContent || !Array.isArray(articles)) {
    return res.status(400).json({
      error: "Target content and articles array are required.",
    });
  }

  try {
    const allArticlesContent = articles
      .map((article) => article.content)
      .join("\n");

    const { similarityPercentage, matched_text, highlightedTextFromIp } =
      await compareContentSimilarity(targetContent, allArticlesContent);

    res.json({
      similarityPercentage,
      matched_text,
      highlightedTextFromIp,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred during the batch plagiarism check.",
    });
  }
};
