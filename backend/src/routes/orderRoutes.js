const express = require("express");
const router = express.Router();
const { verifyToken, verifyUser, verifyAdmin } = require("../middleware/authMiddleware");
const { uploadReceipt } = require("../config/multer");
const {
  createOrder,
  getMyOrders,
  getAdminOrders,
  verifyOrder,
} = require("../controllers/orderController");

router.post("/", verifyUser, uploadReceipt, createOrder);
router.get("/my", verifyUser, getMyOrders);
router.get("/admin", verifyAdmin, getAdminOrders);
router.patch("/:id/verify", verifyAdmin, verifyOrder);

module.exports = router;
