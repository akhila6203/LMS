const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userProfileController");

router.use(verifyUser);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.put("/password", changePassword);

module.exports = router;
