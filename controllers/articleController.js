const axios = require("axios");

/**
 * Fetches news articles from NewsAPI matching the query and sources.
 * @param {import("express").Request} req - Express request with query and sources in body.
 * @param {import("express").Response} res - Express response.
 */
exports.fetchArticles = async (req, res) => {
  const { query, sources } = req.body;

  if (!query || !sources) {
    return res.status(400).json({ error: "Query and sources are required." });
  }

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&sources=${encodeURIComponent(sources)}&pageSize=10&apiKey=${
      process.env.NEWSAPI_KEY
    }`;

    const response = await axios.get(url);
    const articles = response.data.articles || [];
    res.json({ articles });
  } catch (error) {
    console.error("Error fetching articles:", error.message);

    if (error.response) {
      console.error("NewsAPI error status:", error.response.status);
    }

    res.status(500).json({ error: "Failed to fetch articles." });
  }
};
