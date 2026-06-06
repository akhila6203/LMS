const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const {
  getAllMaterials,
  createMaterial,
  deleteMaterial,
} = require("../controllers/materialController");

router.use(verifyAdmin);

router.get("/", getAllMaterials);
router.post("/", createMaterial);
router.delete("/:sourceType/:id", deleteMaterial);

module.exports = router;
