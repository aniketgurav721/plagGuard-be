const { embedText, cosineSimilarity } = require("../config/embeddings");
const log = require("../config/log");

const normalizeText = (text) =>
  text
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const splitSentences = (text) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

/**
 * Compares user text against fetched articles using local embeddings and returns similarity metrics.
 * @param {string} inputContent - Text submitted by the user.
 * @param {string} allArticlesContent - Combined content from reference articles.
 * @returns {Promise<{similarityPercentage: number, matched_text: string, highlightedTextFromIp: string}>}
 */
const compareContentSimilarity = async (inputContent, allArticlesContent) => {
  try {
    log.info("Computing plagiarism similarity with local embeddings.", {
      inputContentLength: inputContent.length,
      referenceContentLength: allArticlesContent.length,
    });

    const normalizedReference = normalizeText(allArticlesContent);
    const normalizedTarget = normalizeText(inputContent);

    if (normalizedTarget && normalizedReference.includes(normalizedTarget)) {
      return {
        similarityPercentage: 100,
        matched_text: inputContent,
        highlightedTextFromIp: inputContent,
      };
    }

    const targetSentences = splitSentences(inputContent);
    if (targetSentences.length === 0) {
      return {
        similarityPercentage: 0,
        matched_text: "",
        highlightedTextFromIp: inputContent,
      };
    }

    const referenceSentences = splitSentences(allArticlesContent);
    const referenceEmbeddings = await Promise.all(
      referenceSentences.map((sentence) => embedText(sentence))
    );

    const matchedSentences = [];

    for (const sentence of targetSentences) {
      const normalizedSentence = normalizeText(sentence);

      if (
        normalizedSentence.length >= 20 &&
        normalizedReference.includes(normalizedSentence)
      ) {
        matchedSentences.push(sentence);
        continue;
      }

      const sentenceEmbedding = await embedText(sentence);
      const sentenceScore = Math.max(
        ...referenceEmbeddings.map((referenceEmbedding) =>
          cosineSimilarity(sentenceEmbedding, referenceEmbedding)
        ),
        0
      );

      if (sentenceScore >= 0.5) {
        matchedSentences.push(sentence);
      }
    }

    const similarityPercentage = Number(
      ((matchedSentences.length / targetSentences.length) * 100).toFixed(2)
    );

    return {
      similarityPercentage,
      matched_text: matchedSentences.join(" "),
      highlightedTextFromIp: inputContent,
    };
  } catch (error) {
    log.error("Error comparing contents with local embeddings.", {
      message: error.message,
      stack: error.stack,
    });
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
  log.info("Plagiarism check request received.", {
    targetContentLength: targetContent?.length,
    articleCount: Array.isArray(articles) ? articles.length : 0,
  });

  if (!targetContent || !Array.isArray(articles)) {
    log.warn("Invalid plagiarism request payload.", { body: req.body });
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

    log.info("Plagiarism check completed.", { similarityPercentage });
    res.json({
      similarityPercentage,
      matched_text,
      highlightedTextFromIp,
    });
  } catch (error) {
    log.error("Plagiarism check failed.", { message: error.message, stack: error.stack });
    res.status(500).json({
      error: "An error occurred during the batch plagiarism check.",
    });
  }
};
