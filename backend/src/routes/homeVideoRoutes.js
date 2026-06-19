const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const { uploadVideo } = require("../config/multer");
const {
  getPublicHomeVideo,
  getAdminHomeVideos,
  createHomeVideo,
  updateHomeVideo,
  deleteHomeVideo,
} = require("../controllers/homeVideoController");

router.get("/public", getPublicHomeVideo);
router.get("/", verifyAdmin, getAdminHomeVideos);

router.post("/", verifyAdmin, (req, res, next) => {
  uploadVideo(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, createHomeVideo);

router.put("/:id", verifyAdmin, (req, res, next) => {
  uploadVideo(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, updateHomeVideo);

router.delete("/:id", verifyAdmin, deleteHomeVideo);

module.exports = router;