const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middleware/authMiddleware");
const {
  getMyCourses,
  markLessonProgress,
  completeQuiz,
  deleteEnrollment,
  getRecommended,
} = require("../controllers/enrollmentController");

router.get("/my-courses", verifyUser, getMyCourses);
router.get("/recommended", verifyUser, getRecommended);
router.post("/courses/:courseId/progress", verifyUser, markLessonProgress);
router.post("/courses/:courseId/quiz-complete", verifyUser, completeQuiz);
router.delete("/courses/:courseId", verifyUser, deleteEnrollment);

module.exports = router;
