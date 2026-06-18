const { query } = require("../utils/dbQuery");

exports.getSchools = async (_req, res) => {
  try {
    const fromTable = await query(
      `SELECT name FROM schools WHERE name IS NOT NULL AND name != '' ORDER BY name ASC`
    );

    res.json({ schools: fromTable.map((r) => r.name) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch schools" });
  }
};

exports.createSchool = async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) {
    return res.status(400).json({ message: "School name is required" });
  }

  try {
    await query(`INSERT IGNORE INTO schools (name) VALUES (?)`, [name]);
    res.status(201).json({ message: "School added", name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add school" });
  }
};

/** Save custom school name when admin adds a student with "Others" */
exports.ensureSchoolName = async (name) => {
  const trimmed = String(name || "").trim();
  if (!trimmed) return;
  try {
    await query(`INSERT IGNORE INTO schools (name) VALUES (?)`, [trimmed]);
  } catch (err) {
    console.error("ensureSchoolName:", err.message);
  }
};
