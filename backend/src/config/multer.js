const path = require("path");
const fs = require("fs");
const multer = require("multer");

const root = path.join(__dirname, "../../uploads");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir(path.join(root, "videos"));
ensureDir(path.join(root, "materials"));
ensureDir(path.join(root, "receipts"));
ensureDir(path.join(root, "banners"));


const makeStorage = (folder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = path.join(root, folder);
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${safe}`);
    },
  });

const fileFilter = (_req, file, cb) => {
  if (file) cb(null, true);
  else cb(new Error("Invalid file"), false);
};

exports.uploadVideo = multer({
  storage: makeStorage("videos"),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter,
}).single("file");

exports.uploadMaterial = multer({
  storage: makeStorage("materials"),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
}).single("file");

exports.uploadReceipt = multer({
  storage: makeStorage("receipts"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file?.mimetype?.startsWith("image/")) cb(null, true);
    else cb(new Error("Receipt must be an image"), false);
  },
}).single("receipt");

exports.uploadBanner = multer({
  storage: makeStorage("banners"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file?.mimetype?.startsWith("image/")) cb(null, true);
    else cb(new Error("Banner must be an image"), false);
  },
}).single("banner");

exports.uploadsRoot = root;
