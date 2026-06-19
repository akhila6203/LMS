const express = require("express");

const { verifyAdmin } = require("../middleware/authMiddleware");

const {

  getSubjects,

  createSubject,

  updateSubject,

  deleteSubject,

} = require("../controllers/subjectController");



const router = express.Router();



router.get("/public", getSubjects);

router.get("/", verifyAdmin, getSubjects);

router.post("/", verifyAdmin, createSubject);

router.put("/:id", verifyAdmin, updateSubject);

router.delete("/:id", verifyAdmin, deleteSubject);



module.exports = router;

