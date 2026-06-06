const express = require("express");
const router = express.Router();

const { verifyAdmin } = require("../middleware/authMiddleware");
const { uploadBanner } = require("../config/multer");

const {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  deleteBanner,
} = require("../controllers/bannerController");

router.get("/public", getPublicBanners);

router.get("/", verifyAdmin, getAdminBanners);

router.post("/", verifyAdmin, (req, res, next) => {
  uploadBanner(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, createBanner);

router.delete("/:id", verifyAdmin, deleteBanner);

module.exports = router;