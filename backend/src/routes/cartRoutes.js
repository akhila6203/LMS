const express = require("express");
const router = express.Router();

const {
  addToCart,
  getMyCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const { verifyUser } = require("../middleware/authMiddleware");

router.get("/", verifyUser, getMyCart);

router.post("/", verifyUser, addToCart);

router.delete("/clear", verifyUser, clearCart);

router.delete("/:courseId", verifyUser, removeFromCart);


module.exports = router;