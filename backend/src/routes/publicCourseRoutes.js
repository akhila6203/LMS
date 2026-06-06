const express = require("express");
const router = express.Router();
const {
  getPublicCourses,
  getPublicCourseById,
} = require("../controllers/courseController");

router.get("/", getPublicCourses);
router.get("/:id", getPublicCourseById);

module.exports = router;
