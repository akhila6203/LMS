const { query } = require("../utils/dbQuery");

const fileUrl = (req, filename) => {
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/videos/${filename}`;
};

exports.getPublicHomeVideo = async (_req, res) => {
  try {
    const rows = await query(
      `SELECT * FROM home_demo_videos
       WHERE status='Active'
       ORDER BY id DESC
       LIMIT 1`
    );

    res.json({ video: rows[0] || null });
  } catch {
    res.status(500).json({ message: "Failed to fetch demo video" });
  }
};

exports.getAdminHomeVideos = async (_req, res) => {
  try {
    const videos = await query(
      `SELECT * FROM home_demo_videos ORDER BY id DESC`
    );

    res.json({ videos });
  } catch {
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};

exports.createHomeVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Video is required" });
  }

  try {
    const videoUrl = fileUrl(req, req.file.filename);

    await query(`UPDATE home_demo_videos SET status='Inactive'`);

    await query(
      `INSERT INTO home_demo_videos (video_url, status)
       VALUES (?, 'Active')`,
      [videoUrl]
    );

    res.status(201).json({ message: "Demo video added", videoUrl });
  } catch {
    res.status(500).json({ message: "Failed to add demo video" });
  }
};

exports.deleteHomeVideo = async (req, res) => {
  try {
    await query(`DELETE FROM home_demo_videos WHERE id = ?`, [req.params.id]);
    res.json({ message: "Video deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete video" });
  }
};

exports.updateHomeVideo = async (req, res) => {
  const id = req.params.id;
  const status = req.body.status;

  try {
    if (req.file) {
      const videoUrl = fileUrl(req, req.file.filename);
      await query(`UPDATE home_demo_videos SET video_url = ? WHERE id = ?`, [videoUrl, id]);
    }

    if (status) {
      if (status === "Active") {
        await query(`UPDATE home_demo_videos SET status='Inactive' WHERE id != ?`, [id]);
      }
      await query(`UPDATE home_demo_videos SET status = ? WHERE id = ?`, [status, id]);
    }

    const rows = await query(`SELECT * FROM home_demo_videos WHERE id = ?`, [id]);
    if (!rows.length) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({ message: "Video updated", video: rows[0] });
  } catch {
    res.status(500).json({ message: "Failed to update demo video" });
  }
};