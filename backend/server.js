const express = require("express");
const cors = require("cors");
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
const wishlistRoutes = require("./src/routes/wishlistRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const enrollmentRoutes = require("./src/routes/enrollmentRoutes");
const adminDashboardRoutes = require("./src/routes/adminDashboardRoutes");
// const adminSettingsRoutes = require("./src/routes/adminSettingsRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const bannerRoutes = require("./src/routes/bannerRoutes");
const homeVideoRoutes = require("./src/routes/homeVideoRoutes");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/public/courses", publicCourseRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/user/profile", userProfileRoutes);
app.use("/api/learner", learnerRoutes);
app.use("/api/user/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/learner/enrollments", enrollmentRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
// app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/home-video", homeVideoRoutes);

app.get("/", (_req, res) => {
  res.send("Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
