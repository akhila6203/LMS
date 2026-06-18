const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: "user",
  status: user.status,
  classLevel: user.class_level || "",
  school: user.school || "",
  google_login: !!user.google_login,
  authProvider: "password",
});

/**
 * Email + password login for rows in `users` (admin-created / invited students).
 * Disabled on route — learners use Google Sign-In (`users` table) instead.
 * Admin login remains in adminAuthController → `admins` table.
 */
exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;

  db.query(sql, [normalizedEmail], async (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database Error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const user = result[0];

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Your account is inactive. Contact your admin.",
      });
    }

    const stored = user.password || "";

    if (!stored) {
      return res.status(401).json({
        message: "Use Google sign-in for this account, or ask admin for a password.",
      });
    }

    let match = false;

    if (stored.startsWith("$2")) {
      match = await bcrypt.compare(password, stored);
    } else {
      match = stored === password;
    }

    if (!match) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign(
      { id: user.id, role: "user", authProvider: "password" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: sanitizeUser(user),
    });
  });
};
