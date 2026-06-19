const express = require("express");
const router = express.Router();
const { googleLogin } = require("../controllers/googleAuthController");
const { getMe, logout } = require("../controllers/sessionAuthController");

// Legacy email/password learner login (admin-invited users table) — kept for reference
// router.post("/login", loginUser);

router.get("/me", getMe);
router.post("/logout", logout);
router.post("/google-login", googleLogin);

module.exports = router;
