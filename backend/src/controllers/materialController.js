const { query } = require("../utils/dbQuery");

const formatRow = (row, sourceType) => ({
  id: `${sourceType === "video" ? "v" : "m"}-${row.id}`,
  dbId: row.id,
  sourceType,
  title: row.title,
  type: sourceType === "video" ? "Video" : row.type || "PDF",
  url: row.url || "",
  size: row.size || null,
  duration: row.duration || "",
  courseId: row.course_id,
  course: row.course_title,
  category: row.category || "",
  subCategory: row.sub_category || "",
  uploadedBy: row.instructor || "Admin",
  uploadedAt: row.uploaded_at,
});

exports.getAllMaterials = async (_req, res) => {
  try {
    const materialRows = await query(
      `SELECT cm.id, cm.title, cm.type, cm.url, cm.uploaded_at,
              c.id AS course_id, c.title AS course_title, c.category, c.sub_category, c.instructor
       FROM course_materials cm
       INNER JOIN courses c ON c.id = cm.course_id
       WHERE c.status = 'Active'
       ORDER BY cm.uploaded_at DESC`
    );

    const videoRows = await query(
      `SELECT cv.id, cv.title, cv.url, cv.duration, cv.uploaded_at,
              c.id AS course_id, c.title AS course_title, c.category, c.sub_category, c.instructor
       FROM course_videos cv
       INNER JOIN courses c ON c.id = cv.course_id
       WHERE c.status = 'Active'
       ORDER BY cv.uploaded_at DESC`
    );

    const materials = [
      ...materialRows.map((r) => formatRow(r, "material")),
      ...videoRows.map((r) => formatRow(r, "video")),
    ].sort(
      (a, b) =>
        new Date(b.uploadedAt || 0).getTime() -
        new Date(a.uploadedAt || 0).getTime()
    );

    res.json({ materials });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch materials" });
  }
};

exports.createMaterial = async (req, res) => {
  const {
    title,
    type = "PDF",
    url = "",
    courseId,
    category,
    subCategory,
    addToMatching = false,
    duration = "",
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (!url?.trim() && type !== "Link") {
    return res.status(400).json({ message: "File URL is required" });
  }

  try {
    let courseIds = [];

    if (addToMatching && (category || subCategory)) {
      let sql = "SELECT id FROM courses WHERE 1=1";
      const params = [];
      if (category?.trim()) {
        sql += " AND category = ?";
        params.push(category.trim());
      }
      if (subCategory?.trim()) {
        sql += " AND sub_category = ?";
        params.push(subCategory.trim());
      }
      const rows = await query(sql, params);
      courseIds = rows.map((r) => r.id);
    } else if (courseId) {
      courseIds = [Number(courseId)];
    }

    if (!courseIds.length) {
      return res.status(400).json({
        message: "Select a course or matching category/sub-category",
      });
    }

    const isVideo = type === "Video";
    const uploadedAt = new Date();

    for (const cid of courseIds) {
      const exists = await query("SELECT id FROM courses WHERE id = ? LIMIT 1", [
        cid,
      ]);
      if (!exists.length) continue;

      if (isVideo) {
        const countRows = await query(
          "SELECT COUNT(*) AS cnt FROM course_videos WHERE course_id = ?",
          [cid]
        );
        const sortOrder = Number(countRows[0]?.cnt) || 0;
        await query(
          `INSERT INTO course_videos (course_id, title, url, duration, sort_order, uploaded_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [cid, title.trim(), url.trim(), duration || "", sortOrder, uploadedAt]
        );
      } else {
        const countRows = await query(
          "SELECT COUNT(*) AS cnt FROM course_materials WHERE course_id = ?",
          [cid]
        );
        const sortOrder = Number(countRows[0]?.cnt) || 0;
        await query(
          `INSERT INTO course_materials (course_id, title, type, url, sort_order, uploaded_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [cid, title.trim(), type, url.trim(), sortOrder, uploadedAt]
        );
      }
    }

    res.status(201).json({
      message: `Added to ${courseIds.length} course(s)`,
      count: courseIds.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add material" });
  }
};

exports.deleteMaterial = async (req, res) => {
  const { sourceType, id } = req.params;

  if (!["material", "video"].includes(sourceType)) {
    return res.status(400).json({ message: "Invalid material type" });
  }

  const table =
    sourceType === "video" ? "course_videos" : "course_materials";

  try {
    const result = await query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Material not found" });
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete material" });
  }
};
