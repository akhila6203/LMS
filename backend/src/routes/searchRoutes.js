const express = require("express");
const { searchContent } = require("../controllers/searchController");
const { loadOptionalUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", loadOptionalUser, searchContent);

module.exports = router;
