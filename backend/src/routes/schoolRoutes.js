const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const { getSchools, createSchool } = require("../controllers/schoolController");

router.get("/", verifyAdmin, getSchools);
router.post("/", verifyAdmin, createSchool);

module.exports = router;
