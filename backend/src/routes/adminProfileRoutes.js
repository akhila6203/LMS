const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/adminProfileController");

router.use(verifyAdmin);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.put("/password", changePassword);

module.exports = router;
