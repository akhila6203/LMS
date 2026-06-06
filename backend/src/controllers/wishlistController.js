const { query } = require("../utils/dbQuery");
const { enrichCourse } = require("../utils/courseLabels");

const accountTypeFromUser = (reqUser) =>
  reqUser?.authProvider === "google" ? "google_users" : "users";

const mapCourseRow = (row) => {
  const videoCount = Number(row.video_count) || 0;
  return enrichCourse(
    {
      id: row.id,
      title: row.title,
      category: row.category,
      subCategory: row.sub_category,
      subject: row.subject,
      classLevel: row.class_level,
      instructor: row.instructor,
      level: row.level,
      description: row.description,
      status: row.status,
      students: row.students,
      thumbnail: row.thumbnail,
      createdAt: row.created_at,
      lessonCount: videoCount,
      lessons: videoCount,
      reviews: row.students || 0,
      rating: 4.8,
    },
    row
  );
};

const dbErrorMessage = (err) => {
  if (err?.code === "ER_NO_SUCH_TABLE") {
    return "Wishlist table missing. Run database/wishlist.sql.";
  }
  return err?.message || "Database error";
};

exports.getWishlist = async (req, res) => {
  try {
    const accountType = accountTypeFromUser(req.user);

    const rows = await query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM course_videos v WHERE v.course_id = c.id) AS video_count
       FROM user_wishlist w
       INNER JOIN courses c ON c.id = w.course_id AND c.status = 'Active'
       WHERE w.user_id = ? AND w.account_type = ?
       ORDER BY w.created_at DESC`,
      [req.user.id, accountType]
    );

    const courses = rows.map(mapCourseRow);
    const courseIds = courses.map((c) => c.id);

    res.json({ courseIds, courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: dbErrorMessage(err) });
  }
};

exports.addToWishlist = async (req, res) => {
  const courseId = Number(req.body?.courseId);
  if (!Number.isInteger(courseId) || courseId < 1) {
    return res.status(400).json({ message: "Valid courseId is required" });
  }

  try {
    const courseRows = await query(
      "SELECT id FROM courses WHERE id = ? AND status = 'Active' LIMIT 1",
      [courseId]
    );
    if (!courseRows.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    const accountType = accountTypeFromUser(req.user);

    await query(
      `INSERT IGNORE INTO user_wishlist (user_id, account_type, course_id)
       VALUES (?, ?, ?)`,
      [req.user.id, accountType, courseId]
    );

    res.status(201).json({ message: "Added to wishlist", courseId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: dbErrorMessage(err) });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const courseId = Number(req.params.courseId);
  if (!Number.isInteger(courseId) || courseId < 1) {
    return res.status(400).json({ message: "Valid course id is required" });
  }

  try {
    const accountType = accountTypeFromUser(req.user);

    const result = await query(
      `DELETE FROM user_wishlist
       WHERE user_id = ? AND account_type = ? AND course_id = ?`,
      [req.user.id, accountType, courseId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    res.json({ message: "Removed from wishlist", courseId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: dbErrorMessage(err) });
  }
};
