const bcrypt = require("bcryptjs");
const { query } = require("../utils/dbQuery");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const MAX_AVATAR_LENGTH = 800000;

const dbErrorMessage = (err) => {
  if (err?.code === "ER_BAD_FIELD_ERROR") {
    return "Database missing bio/avatar columns. Run database/admin.sql in phpMyAdmin.";
  }
  return err?.message || "Database error";
};

const toProfile = (row) => ({
  id: row.id,
  name: row.name || "",
  email: row.email || "",
  bio: row.bio || "",
  avatar: row.avatar || null,
  role: "admin",
  status: row.status,
});

exports.getProfile = async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, name, email, bio, avatar, status
       FROM admins WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ profile: toProfile(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: dbErrorMessage(err) });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email, bio, avatar } = req.body;

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (avatar && String(avatar).length > MAX_AVATAR_LENGTH) {
    return res.status(400).json({
      message: "Image is too large. Please use a smaller photo.",
    });
  }

  try {
    const duplicate = await query(
      `SELECT id FROM admins WHERE email = ? AND id != ? LIMIT 1`,
      [normalizedEmail, req.user.id]
    );
    if (duplicate.length) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const userEmail = await query(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );
    if (userEmail.length) {
      return res.status(409).json({ message: "Email already registered as student" });
    }

    const googleEmail = await query(
      `SELECT id FROM google_users WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );
    if (googleEmail.length) {
      return res.status(409).json({ message: "Email already registered as Google student" });
    }

    await query(
      `UPDATE admins
       SET name = ?, email = ?, bio = ?, avatar = ?
       WHERE id = ?`,
      [name.trim(), normalizedEmail, bio?.trim() || null, avatar || null, req.user.id]
    );

    const rows = await query(
      `SELECT id, name, email, bio, avatar, status FROM admins WHERE id = ?`,
      [req.user.id]
    );

    res.json({ message: "Profile saved", profile: toProfile(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: dbErrorMessage(err) });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "Current, new and confirm password are required",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be 8+ chars with upper, lower, number and special character",
    });
  }

  try {
    const rows = await query(`SELECT password FROM admins WHERE id = ?`, [
      req.user.id,
    ]);

    if (!rows.length) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const stored = rows[0].password || "";
    const match = stored.startsWith("$2")
      ? await bcrypt.compare(currentPassword, stored)
      : stored === currentPassword;

    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE admins SET password = ? WHERE id = ?`, [
      hashed,
      req.user.id,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to change password" });
  }
};
