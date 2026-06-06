const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/adminDashboardController");

router.get("/", verifyAdmin, getDashboard);

module.exports = router;
