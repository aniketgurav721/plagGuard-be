const express = require("express");
const { paraphraseController } = require("../controllers/paraphraseController");
const authenticate = require("../middlewares/authenticate");
const router = express.Router();

router.post("/paraphrase-text", authenticate, paraphraseController);

module.exports = router;
