const bcrypt = require("bcryptjs");
const { query } = require("../utils/dbQuery");
const { accountMeta, isGoogleAuth } = require("../utils/userAccounts");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const MAX_AVATAR_LENGTH = 800000;

const dbErrorMessage = (err) => {
  if (err?.code === "ER_BAD_FIELD_ERROR") {
    return "Database missing columns. Run database/users.sql and database/google_users.sql.";
  }
  return err?.message || "Database error";
};

const toProfile = (row, reqUser) => ({
  id: row.id,
  name: row.name || "",
  email: row.email || "",
  bio: row.bio || "",
  avatar: row.avatar || null,
  google_login: isGoogleAuth(reqUser) || !!row.google_login,
  role: "user",
  status: row.status,
  authProvider: reqUser.authProvider || "password",
});

exports.getProfile = async (req, res) => {
  try {
    const { table } = accountMeta(req.user);
    const rows = await query(
      `SELECT id, name, email, bio, avatar, status
       FROM ${table} WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = toProfile(
      { ...rows[0], google_login: isGoogleAuth(req.user) ? 1 : 0 },
      req.user
    );
    res.json({ profile });
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
    const { table } = accountMeta(req.user);

    const duplicate = await query(
      `SELECT id FROM ${table} WHERE email = ? AND id != ? LIMIT 1`,
      [normalizedEmail, req.user.id]
    );
    if (duplicate.length) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const adminEmail = await query(
      `SELECT id FROM admins WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );
    if (adminEmail.length) {
      return res.status(409).json({ message: "Email already registered as admin" });
    }

    const otherTable = table === "google_users" ? "users" : "google_users";
    const otherDup = await query(
      `SELECT id FROM ${otherTable} WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );
    if (otherDup.length) {
      return res.status(409).json({ message: "Email already in use" });
    }

    await query(
      `UPDATE ${table}
       SET name = ?, email = ?, bio = ?, avatar = ?
       WHERE id = ?`,
      [
        name.trim(),
        normalizedEmail,
        bio?.trim() || null,
        avatar || null,
        req.user.id,
      ]
    );

    const rows = await query(
      `SELECT id, name, email, bio, avatar, status FROM ${table} WHERE id = ?`,
      [req.user.id]
    );

    res.json({
      message: "Profile saved",
      profile: toProfile(
        { ...rows[0], google_login: isGoogleAuth(req.user) ? 1 : 0 },
        req.user
      ),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: dbErrorMessage(err) });
  }
};

exports.changePassword = async (req, res) => {
  if (isGoogleAuth(req.user)) {
    return res.status(400).json({
      message: "You signed in with Google. Password is managed by your Google account.",
    });
  }

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
    const rows = await query(
      `SELECT password, google_login FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const stored = rows[0].password || "";
    if (!stored) {
      return res.status(400).json({
        message: "You signed in with Google. Set password via Google account or contact admin.",
      });
    }

    const match = stored.startsWith("$2")
      ? await bcrypt.compare(currentPassword, stored)
      : stored === currentPassword;

    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await query(
      `UPDATE users SET password = ?, google_login = 0 WHERE id = ?`,
      [hashed, req.user.id]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to change password" });
  }
};
