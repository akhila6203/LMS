const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const adminAuthRoutes = require("./src/routes/adminAuthRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const publicCourseRoutes = require("./src/routes/publicCourseRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const materialRoutes = require("./src/routes/materialRoutes");
const adminProfileRoutes = require("./src/routes/adminProfileRoutes");
const userProfileRoutes = require("./src/routes/userProfileRoutes");
const learnerRoutes = require("./src/routes/learnerRoutes");
const enrollmentRoutes = require("./src/routes/enrollmentRoutes");
const adminDashboardRoutes = require("./src/routes/adminDashboardRoutes");
// const adminSettingsRoutes = require("./src/routes/adminSettingsRoutes");
const bannerRoutes = require("./src/routes/bannerRoutes");
const homeVideoRoutes = require("./src/routes/homeVideoRoutes");
const schoolRoutes = require("./src/routes/schoolRoutes");
const subjectRoutes = require("./src/routes/subjectRoutes");
const userRoutes = require("./src/routes/userRoutes");
const searchRoutes = require("./src/routes/searchRoutes");
const vocabularyRoutes = require("./src/routes/vocabularyRoutes");
const { ensureSchema } = require("./src/utils/ensureSchema");


const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  ...new Set([
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5173",
    ...(process.env.FRONTEND_URL || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/classes", courseRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/public/classes", publicCourseRoutes);
app.use("/api/public/courses", publicCourseRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/user/profile", userProfileRoutes);
app.use("/api/learner", learnerRoutes);
app.use("/api/learner/enrollments", enrollmentRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
// app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/home-video", homeVideoRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/vocabulary", vocabularyRoutes);

app.get("/", (_req, res) => {
  res.send("Backend Running");
});

async function waitForDatabase(retries = 5, delayMs = 2000) {
  const { query } = require("./src/utils/dbQuery");

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await query("SELECT 1");
      return;
    } catch (err) {
      console.warn(
        `Database not ready (attempt ${attempt}/${retries}): ${err.message}`
      );
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn(
      "GOOGLE_CLIENT_ID is not set — learner Google sign-in will fail until backend .env matches frontend VITE_GOOGLE_CLIENT_ID."
    );
  }
  try {
    await waitForDatabase();
    await ensureSchema();
  } catch (err) {
    console.error("Database startup failed:", err.message);
    console.error(
      "Start MySQL, then import database/schema.sql and restart the backend."
    );
  }
});
