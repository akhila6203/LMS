const { query } = require("../utils/dbQuery");

async function getUserClassLevel(userId) {
  if (!userId) return "";
  const rows = await query(
    `SELECT class_level FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  return String(rows[0]?.class_level || "").trim();
}

exports.searchContent = async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q || q.length < 2) {
    return res.json({ results: [] });
  }

  const like = `%${q}%`;
  const isAdmin = req.user?.role === "admin";
  let classLevel = "";

  if (req.user?.role === "user") {
    classLevel = await getUserClassLevel(req.user.id);
  }

  try {
    const params = [like, like, like, like, like];
    let classFilter = "";

    if (!isAdmin && classLevel) {
      classFilter = " AND c.class_level = ?";
      params.push(classLevel);
    }

    const courseRows = await query(
      `SELECT DISTINCT c.id, c.title, c.class_level, c.subject, c.instructor,
        (SELECT COUNT(*) FROM course_videos v WHERE v.course_id = c.id) AS video_count
       FROM courses c
       LEFT JOIN course_videos cv ON cv.course_id = c.id
       WHERE c.status = 'Active'
         AND (
           c.title LIKE ? OR c.subject LIKE ? OR c.class_level LIKE ?
           OR c.instructor LIKE ? OR cv.title LIKE ?
         )
         AND EXISTS (SELECT 1 FROM course_videos v2 WHERE v2.course_id = c.id)${classFilter}
       ORDER BY c.title ASC
       LIMIT 20`,
      params
    );

    const results = courseRows.map((row) => ({
      type: "class",
      id: row.id,
      title: row.title,
      subtitle: [row.class_level, row.subject].filter(Boolean).join(" · "),
      classLevel: row.class_level,
      subject: row.subject,
      lessonCount: Number(row.video_count) || 0,
    }));

    res.json({ results, query: q });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
};
