const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/authController");
const { googleLogin } = require("../controllers/googleAuthController");

// Legacy email/password learner login (admin-invited users table) — kept for reference
// router.post("/login", loginUser);

router.post("/google-login", googleLogin);

module.exports = router;
