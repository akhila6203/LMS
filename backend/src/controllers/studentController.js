const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { query } = require("../utils/dbQuery");
const {
  listStudents,
  countStudents,
  statsStudents,
  distinctSchools,
} = require("../utils/studentListSql");
const { ensureSchoolName } = require("./schoolController");
const { fetchSubjectProgressByUserIds } = require("../utils/progressHelpers");

const mapStudentRow = (row, subjectProgress = []) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  avatar: row.avatar || null,
  classLevel: row.class_level || "",
  school: row.school || "",
  completed: Number(row.completed) || 0,
  progress: Number(row.progress) || 0,
  subjectProgress,
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

const isGmailEmail = (email) =>
  String(email || "").trim().toLowerCase().endsWith("@gmail.com");

const emailTaken = async (email, excludeUserId = null) => {
  const u = await query(
    excludeUserId
      ? "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1"
      : "SELECT id FROM users WHERE email = ? LIMIT 1",
    excludeUserId ? [email, excludeUserId] : [email]
  );
  const a = await query("SELECT id FROM admins WHERE email = ? LIMIT 1", [email]);
  return u.length > 0 || a.length > 0;
};

const insertStudent = async ({ name, email, password, joinedDate, classLevel, school }) => {
  const hashed = await bcrypt.hash(password, 10);

  const userResult = await query(
    `INSERT INTO users (name, email, password, google_login, status, class_level, school)
     VALUES (?, ?, ?, 0, 'active', ?, ?)`,
    [name, email, hashed, classLevel || "", school || ""]
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
    const classLevel = String(req.query.classLevel || req.query.class_level || "").trim();
    const school = String(req.query.school || "").trim();
    const filters = { search, classLevel, school };

    const countQ = countStudents(filters);
    const countRows = await query(countQ.sql, countQ.params);
    const total = Number(countRows[0]?.total) || 0;

    const statsQ = statsStudents(filters);
    const statsRows = await query(statsQ.sql, statsQ.params);

    const listQ = listStudents(filters, limit, offset);
    const rows = await query(listQ.sql, listQ.params);

    const userIds = rows.map((r) => r.id);
    const subjectProgressMap = await fetchSubjectProgressByUserIds(userIds);

    const schoolQ = distinctSchools();
    const schoolRows = await query(schoolQ.sql, schoolQ.params);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    res.json({
      students: rows.map((row) =>
        mapStudentRow(row, subjectProgressMap[row.id] || [])
      ),
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
      filterOptions: {
        schools: schoolRows.map((r) => r.school).filter(Boolean),
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
  const joinedDate = parseJoinedDate(req.body.joined_date ?? req.body.date);
  const classLevel = String(req.body.classLevel || req.body.class_level || "").trim();
  const school = String(req.body.school || "").trim();

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  if (!classLevel) {
    return res.status(400).json({ message: "Class is required" });
  }

  if (!school) {
    return res.status(400).json({ message: "School is required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!isGmailEmail(email)) {
    return res.status(400).json({
      message: "Only Gmail addresses (@gmail.com) can be added as students",
    });
  }

  try {
    if (await emailTaken(email)) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const { userId } = await insertStudent({
      name,
      email,
      password,
      joinedDate,
      classLevel,
      school,
    });

    await ensureSchoolName(school);

    res.status(201).json({
      message: "Student added to users table",
      student: {
        id: userId,
        name,
        email,
        classLevel,
        school,
        password,
      },
      credentials: {
        email,
        password,
        loginUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
        note: "Student can sign in with Google using this Gmail address after admin adds them.",
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

  const hasClassInFile = students.every(
    (s) => s.classLevel || s.class_level || s.class
  );
  const hasSchoolInFile = students.every((s) => s.school);

  if (!hasClassInFile) {
    return res.status(400).json({
      message: "Each row must include a class column in the Excel sheet",
    });
  }

  if (!hasSchoolInFile) {
    return res.status(400).json({
      message: "Each row must include a school column in the Excel sheet",
    });
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
    const joinedDate = parseJoinedDate(row.date ?? row.joined ?? row.joined_date);
    const classLevel = String(
      row.classLevel || row.class_level || row.class || ""
    ).trim();
    const school = String(row.school || "").trim();

    if (!name || !email) {
      errors.push({ row: i + 1, email: email || "—", reason: "Name and email required" });
      continue;
    }

    if (!classLevel) {
      errors.push({ row: i + 1, email, reason: "Class is required" });
      continue;
    }

    if (!school) {
      errors.push({ row: i + 1, email, reason: "School is required" });
      continue;
    }

    if (!isValidEmail(email)) {
      errors.push({ row: i + 1, email, reason: "Invalid email format" });
      continue;
    }

    if (!isGmailEmail(email)) {
      errors.push({ row: i + 1, email, reason: "Only @gmail.com addresses allowed" });
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
        joinedDate,
        classLevel,
        school,
      });

      await ensureSchoolName(school);

      imported.push({ id: userId, name, email, classLevel, school });
      credentials.push({
        name,
        email,
        password: plainPassword,
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
  const {
    invites = [],
    message = "",
    classLevel: bulkClassLevel = "",
    school: bulkSchool = "",
  } = req.body;
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
    const classLevel = String(
      inv.classLevel || inv.class_level || bulkClassLevel || ""
    ).trim();
    const school = String(inv.school || bulkSchool || "").trim();

    if (!email) {
      results.push({ email: "", success: false, reason: "Email required" });
      continue;
    }

    if (!classLevel) {
      results.push({ email, success: false, reason: "Class is required" });
      continue;
    }

    if (!school) {
      results.push({ email, success: false, reason: "School is required" });
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

      const plainPassword = defaultPassword();
      const { userId } = await insertStudent({
        name: name || email.split("@")[0],
        email,
        password: plainPassword,
        joinedDate: null,
        classLevel,
        school,
      });

      const token = crypto.randomBytes(24).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await query(
        `INSERT INTO student_invites (email, name, class_level, school, invite_token, invited_by, status, message, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
        [email, name, classLevel, school, token, adminId, personalMessage, expiresAt]
      );

      await ensureSchoolName(school);

      const inviteLink = `${frontendBase}/login?invite=${token}&email=${encodeURIComponent(email)}`;

      results.push({
        email,
        name: name || email.split("@")[0],
        success: true,
        studentId: userId,
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

exports.updateStudent = async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  if (!studentId) {
    return res.status(400).json({ message: "Invalid student id" });
  }

  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const classLevel = String(req.body.classLevel || req.body.class_level || "").trim();
  const school = String(req.body.school || "").trim();

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  if (!classLevel) {
    return res.status(400).json({ message: "Class is required" });
  }

  if (!school) {
    return res.status(400).json({ message: "School is required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!isGmailEmail(email)) {
    return res.status(400).json({
      message: "Only Gmail addresses (@gmail.com) can be used for students",
    });
  }

  try {
    const existing = await query(
      "SELECT id, email FROM users WHERE id = ? LIMIT 1",
      [studentId]
    );
    if (!existing.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (await emailTaken(email, studentId)) {
      return res.status(409).json({ message: "Email already exists" });
    }

    await query(
      "UPDATE users SET name = ?, email = ?, class_level = ?, school = ? WHERE id = ?",
      [name, email, classLevel, school, studentId]
    );

    await ensureSchoolName(school);

    res.json({
      message: "Student updated",
      student: { id: studentId, name, email, classLevel, school },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update student" });
  }
};

exports.deleteStudent = async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  if (!studentId) {
    return res.status(400).json({ message: "Invalid student id" });
  }

  try {
    const existing = await query(
      "SELECT id, email FROM users WHERE id = ? LIMIT 1",
      [studentId]
    );
    if (!existing.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    const email = existing[0].email;
    await query("DELETE FROM student_invites WHERE email = ?", [email]);
    await query("DELETE FROM users WHERE id = ?", [studentId]);

    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete student" });
  }
};
