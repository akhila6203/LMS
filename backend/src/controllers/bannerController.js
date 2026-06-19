const { query } = require("../utils/dbQuery");

const fileUrl = (req, filename) => {
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/banners/${filename}`;
};

exports.getPublicBanners = async (_req, res) => {
  try {
    const banners = await query(
      `SELECT * FROM banners WHERE status='Active' ORDER BY sort_order ASC, id DESC`
    );
    res.json({ banners });
  } catch {
    res.status(500).json({ message: "Failed to fetch banners" });
  }
};

exports.getAdminBanners = async (_req, res) => {
  try {
    const banners = await query(
      `SELECT * FROM banners ORDER BY sort_order ASC, id DESC`
    );
    res.json({ banners });
  } catch {
    res.status(500).json({ message: "Failed to fetch banners" });
  }
};

exports.createBanner = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Banner image is required" });
  }

  try {
    const imageUrl = fileUrl(req, req.file.filename);

    await query(
      `INSERT INTO banners (image_url, status, sort_order)
       VALUES (?, 'Active', 0)`,
      [imageUrl]
    );

    res.status(201).json({ message: "Banner added", imageUrl });
  } catch {
    res.status(500).json({ message: "Failed to add banner" });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await query(`DELETE FROM banners WHERE id = ?`, [req.params.id]);
    res.json({ message: "Banner deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete banner" });
  }
};

exports.updateBanner = async (req, res) => {
  const id = req.params.id;
  const status = req.body.status;

  try {
    if (req.file) {
      const imageUrl = fileUrl(req, req.file.filename);
      await query(`UPDATE banners SET image_url = ? WHERE id = ?`, [imageUrl, id]);
    }

    if (status) {
      await query(`UPDATE banners SET status = ? WHERE id = ?`, [status, id]);
    }

    const rows = await query(`SELECT * FROM banners WHERE id = ?`, [id]);
    if (!rows.length) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.json({ message: "Banner updated", banner: rows[0] });
  } catch {
    res.status(500).json({ message: "Failed to update banner" });
  }
};