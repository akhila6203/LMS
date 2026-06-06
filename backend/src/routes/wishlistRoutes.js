const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middleware/authMiddleware");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

router.use(verifyUser);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:courseId", removeFromWishlist);

module.exports = router;
