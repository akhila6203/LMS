const express = require("express");
const { verifyUser } = require("../middleware/authMiddleware");
const { getUserSubjects } = require("../controllers/subjectController");

const router = express.Router();

router.get("/subjects", verifyUser, getUserSubjects);

module.exports = router;
