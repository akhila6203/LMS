const path = require("path");

const fileUrl = (req, folder, filename) => {
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/${folder}/${filename}`;
};

exports.uploadVideo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No video file uploaded" });
  }

  res.json({
    url: fileUrl(req, "videos", req.file.filename),
    uploadedAt: new Date().toISOString(),
    fileName: req.file.originalname,
    size: req.file.size,
  });
};

exports.uploadMaterial = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    url: fileUrl(req, "materials", req.file.filename),
    uploadedAt: new Date().toISOString(),
    fileName: req.file.originalname,
    size: req.file.size,
  });
};
