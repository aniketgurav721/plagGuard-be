const express = require("express");
const { checkPlagiarism } = require("../controllers/plagiarismController");

const router = express.Router();

router.post("/check-plagiarism-all", checkPlagiarism);

module.exports = router;
