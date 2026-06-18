const express = require("express");
const { verifyUser } = require("../middleware/authMiddleware");
const { lookupWord } = require("../controllers/vocabularyController");

const router = express.Router();

router.get("/lookup", verifyUser, lookupWord);

module.exports = router;
