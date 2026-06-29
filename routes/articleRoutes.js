const express = require("express");
const { fetchArticles } = require("../controllers/articleController");

const router = express.Router();

router.post("/fetch-articles", fetchArticles);

module.exports = router;
