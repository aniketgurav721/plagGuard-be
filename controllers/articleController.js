const axios = require("axios");
const log = require("../config/log");

/**
 * Fetches news articles from NewsAPI matching the query and sources.
 * @param {import("express").Request} req - Express request with query and sources in body.
 * @param {import("express").Response} res - Express response.
 */
exports.fetchArticles = async (req, res) => {
  const { query, sources } = req.body;
  log.info("Fetch articles request received.", { query, sources });

  if (!query || !sources) {
    log.warn("Missing query or sources in request body.", { body: req.body });
    return res.status(400).json({ error: "Query and sources are required." });
  }

  if (!process.env.NEWSAPI_KEY) {
    log.error("Missing NEWSAPI_KEY environment variable before calling NewsAPI.", { hasNewsApiKey: false });
    return res.status(500).json({ error: "NewsAPI key is not configured." });
  }

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&sources=${encodeURIComponent(sources)}&pageSize=10&apiKey=${
      process.env.NEWSAPI_KEY
    }`;

    log.debug("Requesting articles from NewsAPI.", { url: url.replace(process.env.NEWSAPI_KEY, "[REDACTED]") });
    const response = await axios.get(url);
    const articles = response.data.articles || [];
    log.info("Articles fetched successfully.", { count: articles.length, query, sources });
    res.json({ articles });
  } catch (error) {
    log.error("Error fetching articles.", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response) {
      log.warn("NewsAPI responded with an error status.", {
        status: error.response.status,
      });
    }

    res.status(500).json({ error: "Failed to fetch articles." });
  }
};
