const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const {
  getStudents,
  createStudent,
  bulkImportStudents,
  inviteStudents,
} = require("../controllers/studentController");

router.use(verifyAdmin);

router.get("/", getStudents);
router.post("/", createStudent);
router.post("/bulk-import", bulkImportStudents);
router.post("/invite", inviteStudents);

module.exports = router;
