
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const buildToken = (admin) =>
  jwt.sign(
    { id: admin.id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const sanitizeAdmin = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  bio: admin.bio || "",
  avatar: admin.avatar || null,
  role: "admin",
  status: admin.status,
});

const emailExists = (normalizedEmail, callback) => {
  db.query(
    "SELECT id FROM admins WHERE email = ? LIMIT 1",
    [normalizedEmail],
    (err, adminRows) => {
      if (err) return callback(err);
      if (adminRows.length > 0) return callback(null, true);

      db.query(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [normalizedEmail],
        (err2, userRows) => {
          if (err2) return callback(err2);
          callback(null, userRows.length > 0);
        }
      );
    }
  );
};

exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  emailExists(normalizedEmail, async (err, exists) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = `
        INSERT INTO admins (name, email, password, status)
        VALUES (?, ?, ?, 'active')
      `;

      db.query(
        insertSql,
        [name.trim(), normalizedEmail, hashedPassword],
        (insertErr, result) => {
          if (insertErr) {
            console.error(insertErr);
            return res.status(500).json({ message: "Could not create admin" });
          }

          return res.status(201).json({
            message: "Admin registered successfully",
            adminId: result.insertId,
          });
        }
      );
    } catch {
      return res.status(500).json({ message: "Password encryption failed" });
    }
  });
};

exports.loginAdmin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const sql = `SELECT * FROM admins WHERE email = ? LIMIT 1`;

  db.query(sql, [normalizedEmail], async (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const admin = result[0];

    if (admin.status !== "active") {
      return res.status(403).json({ message: "Admin account is not active" });
    }

    const storedPassword = admin.password || "";
    let passwordMatch = false;

    if (storedPassword.startsWith("$2")) {
      passwordMatch = await bcrypt.compare(password, storedPassword);
    } else {
      passwordMatch = storedPassword === password;
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = buildToken(admin);

    res.json({
      token,
      user: sanitizeAdmin(admin),
    });
  });
};
