const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { query } = require("../utils/dbQuery");
const {
  listStudents,
  countStudents,
  statsStudents,
} = require("../utils/studentListSql");

const mapStudentRow = (row) => ({
  id: row.id,
  accountType: row.account_type || "password",
  name: row.name,
  email: row.email,
  avatar: row.avatar || null,
  enrolled: Number(row.enrolled) || 0,
  completed: Number(row.completed) || 0,
  progress: Number(row.progress) || 0,
  joined: row.joined_date
    ? new Date(row.joined_date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "—",
  status: row.status === "active" ? "Active" : "Inactive",
  googleLogin: !!row.google_login,
});

const parseJoinedDate = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date && !isNaN(raw)) {
    return raw.toISOString().slice(0, 10);
  }
  const str = String(raw).trim();
  if (!str) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  const excelSerial = Number(str);
  if (!isNaN(excelSerial) && excelSerial > 20000 && excelSerial < 60000) {
    const utc = new Date(Date.UTC(1899, 11, 30) + excelSerial * 86400000);
    return utc.toISOString().slice(0, 10);
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
};

const defaultPassword = () =>
  `Lms@${Math.random().toString(36).slice(2, 8)}1`;

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

const normalizeStatus = (raw) => {
  const s = String(raw || "active").trim().toLowerCase();
  if (["inactive", "disabled", "pending"].includes(s)) return "inactive";
  return "active";
};

const emailTaken = async (email) => {
  const u = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  const g = await query("SELECT id FROM google_users WHERE email = ? LIMIT 1", [email]);
  const a = await query("SELECT id FROM admins WHERE email = ? LIMIT 1", [email]);
  return u.length > 0 || g.length > 0 || a.length > 0;
};

const insertStudent = async ({ name, email, password, status, joinedDate }) => {
  const hashed = await bcrypt.hash(password, 10);

  const userResult = await query(
    `INSERT INTO users (name, email, password, google_login, status)
     VALUES (?, ?, ?, 0, ?)`,
    [name, email, hashed, status]
  );

  const userId = userResult.insertId;

  await query(
    `INSERT INTO student_profiles (user_id, enrolled, completed, progress, joined_date)
     VALUES (?, 0, 0, 0, ?)`,
    [userId, joinedDate]
  );

  return { userId, password };
};

exports.getStudents = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );
    const offset = (page - 1) * limit;
    const search = String(req.query.search || "").trim();

    const countQ = countStudents(search);
    const countRows = await query(countQ.sql, countQ.params);
    const total = Number(countRows[0]?.total) || 0;

    const statsQ = statsStudents(search);
    const statsRows = await query(statsQ.sql, statsQ.params);

    const listQ = listStudents(search, limit, offset);
    const rows = await query(listQ.sql, listQ.params);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    res.json({
      students: rows.map(mapStudentRow),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats: {
        total: Number(statsRows[0]?.total) || 0,
        active: Number(statsRows[0]?.active) || 0,
        avgCompletion: Math.round(Number(statsRows[0]?.avgProgress) || 0),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

exports.createStudent = async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password?.trim() || defaultPassword();
  const status = normalizeStatus(req.body.status);
  const joinedDate = parseJoinedDate(req.body.joined_date ?? req.body.date);

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    if (await emailTaken(email)) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const { userId } = await insertStudent({
      name,
      email,
      password,
      status,
      joinedDate,
    });

    res.status(201).json({
      message: "Student added to users table",
      student: {
        id: userId,
        name,
        email,
        status: status === "active" ? "Active" : "Inactive",
        password,
      },
      credentials: {
        email,
        password,
        loginUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
        note: "Share these credentials with the student. They can also sign in with Google using this email.",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not add student" });
  }
};

exports.bulkImportStudents = async (req, res) => {
  const { students = [] } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: "No students to import" });
  }

  const imported = [];
  const skipped = [];
  const errors = [];
  const credentials = [];

  for (let i = 0; i < students.length; i++) {
    const row = students[i];
    const name = row.name?.trim();
    const email = row.email?.trim().toLowerCase();
    const plainPassword = row.password?.trim() || defaultPassword();
    const status = normalizeStatus(row.status);
    const joinedDate = parseJoinedDate(row.date ?? row.joined ?? row.joined_date);

    if (!name || !email) {
      errors.push({ row: i + 1, email: email || "—", reason: "Name and email required" });
      continue;
    }

    if (!isValidEmail(email)) {
      errors.push({ row: i + 1, email, reason: "Invalid email format" });
      continue;
    }

    try {
      if (await emailTaken(email)) {
        skipped.push({ row: i + 1, email, reason: "Email already exists" });
        continue;
      }

      const { userId } = await insertStudent({
        name,
        email,
        password: plainPassword,
        status,
        joinedDate,
      });

      imported.push({ id: userId, name, email, status });
      credentials.push({
        name,
        email,
        password: plainPassword,
        status: status === "active" ? "Active" : "Inactive",
      });
    } catch (err) {
      console.error(err);
      errors.push({ row: i + 1, email, reason: err.message || "Insert failed" });
    }
  }

  res.status(201).json({
    message: `Imported ${imported.length} student(s) into users table`,
    imported: imported.length,
    skipped: skipped.length,
    failed: errors.length,
    credentials,
    details: { imported, skipped, errors },
  });
};

exports.inviteStudents = async (req, res) => {
  const { invites = [], message = "" } = req.body;
  const adminId = req.user?.id || null;

  if (!Array.isArray(invites) || invites.length === 0) {
    return res.status(400).json({ message: "At least one invite is required" });
  }

  const frontendBase =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const results = [];

  for (const inv of invites) {
    const name = inv.name?.trim() || "";
    const email = inv.email?.trim().toLowerCase();
    const personalMessage = inv.message?.trim() || message?.trim() || "";

    if (!email) {
      results.push({ email: "", success: false, reason: "Email required" });
      continue;
    }

    if (!isValidEmail(email)) {
      results.push({ email, success: false, reason: "Invalid email format" });
      continue;
    }

    try {
      if (await emailTaken(email)) {
        results.push({
          email,
          success: false,
          reason: "Already registered",
        });
        continue;
      }

      const token = crypto.randomBytes(24).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await query(
        `INSERT INTO student_invites (email, name, invite_token, invited_by, status, message, expires_at)
         VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
        [email, name, token, adminId, personalMessage, expiresAt]
      );

      const inviteLink = `${frontendBase}/login?invite=${token}&email=${encodeURIComponent(email)}`;

      results.push({
        email,
        name,
        success: true,
        inviteLink,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (err) {
      console.error(err);
      results.push({
        email,
        success: false,
        reason: err.message || "Could not create invite",
      });
    }
  }

  const sent = results.filter((r) => r.success).length;

  res.status(201).json({
    message: `${sent} invite(s) created`,
    sent,
    results,
  });
};
