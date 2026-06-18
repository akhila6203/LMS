const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const {
  getStudents,
  createStudent,
  bulkImportStudents,
  inviteStudents,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

router.use(verifyAdmin);

router.get("/", getStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.post("/bulk-import", bulkImportStudents);
router.post("/invite", inviteStudents);

module.exports = router;
