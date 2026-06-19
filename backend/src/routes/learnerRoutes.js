const express = require("express");
const router = express.Router();
const { verifyToken, verifyUser } = require("../middleware/authMiddleware");
const {
  getLearnerCourses,
  getLearnerCourseById,
  getLearnerDashboard,
} = require("../controllers/learnerController");

router.get("/classes", verifyToken, getLearnerCourses);
router.get("/classes/:id", verifyToken, getLearnerCourseById);
router.get("/courses", verifyToken, getLearnerCourses);
router.get("/courses/:id", verifyToken, getLearnerCourseById);
router.get("/dashboard", verifyUser, getLearnerDashboard);

module.exports = router;
