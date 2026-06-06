const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const { uploadVideo, uploadMaterial } = require("../config/multer");
const {
  uploadVideo: uploadVideoHandler,
  uploadMaterial: uploadMaterialHandler,
} = require("../controllers/uploadController");

router.use(verifyAdmin);

router.post("/video", (req, res, next) => {
  uploadVideo(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
}, uploadVideoHandler);

router.post("/material", (req, res, next) => {
  uploadMaterial(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
}, uploadMaterialHandler);

module.exports = router;
