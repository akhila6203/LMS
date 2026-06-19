const { query } = require("../utils/dbQuery");



async function getUserClassLevel(userId) {

  if (!userId) return "";

  const rows = await query(

    `SELECT class_level FROM users WHERE id = ? LIMIT 1`,

    [userId]

  );

  return String(rows[0]?.class_level || "").trim();

}



function mapSubjectRow(row) {

  return {

    id: row.id,

    name: row.name,

    classLevel: row.class_level,

    status: row.status || "active",

    createdAt: row.created_at,

    updatedAt: row.updated_at,

  };

}



exports.getSubjects = async (req, res) => {

  try {

    const classLevel = String(req.query.classLevel || "").trim();

    const params = [];

    let sql = `SELECT id, name, class_level, status, created_at, updated_at

               FROM subjects

               WHERE name IS NOT NULL AND name != ''`;



    if (classLevel) {

      sql += ` AND class_level = ?`;

      params.push(classLevel);

    }



    sql += ` ORDER BY class_level ASC, name ASC`;



    const rows = await query(sql, params);

    const items = rows.map(mapSubjectRow);

    res.json({

      subjects: items.map((s) => s.name),

      items,

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: "Failed to fetch subjects" });

  }

};



exports.createSubject = async (req, res) => {

  const name = String(req.body.name || "").trim();

  const classLevel = String(req.body.classLevel || "").trim();



  if (!name) {

    return res.status(400).json({ message: "Subject name is required" });

  }

  if (!classLevel) {

    return res.status(400).json({ message: "Class is required" });

  }



  try {

    const existing = await query(

      `SELECT id FROM subjects WHERE name = ? AND class_level = ? LIMIT 1`,

      [name, classLevel]

    );

    if (existing.length) {

      return res.status(409).json({ message: "Subject already exists for this class" });

    }



    const result = await query(

      `INSERT INTO subjects (name, class_level, status) VALUES (?, ?, 'active')`,

      [name, classLevel]

    );



    res.status(201).json({

      message: "Subject added",

      subject: { id: result.insertId, name, classLevel, status: "active" },

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: "Failed to add subject" });

  }

};



exports.updateSubject = async (req, res) => {

  const id = Number(req.params.id);

  const name = String(req.body.name || "").trim();



  if (!id) {

    return res.status(400).json({ message: "Invalid subject id" });

  }

  if (!name) {

    return res.status(400).json({ message: "Subject name is required" });

  }



  try {

    const rows = await query(

      `SELECT id, name, class_level FROM subjects WHERE id = ? LIMIT 1`,

      [id]

    );

    if (!rows.length) {

      return res.status(404).json({ message: "Subject not found" });

    }



    const oldName = rows[0].name;

    const classLevel = rows[0].class_level;



    const duplicate = await query(

      `SELECT id FROM subjects WHERE name = ? AND class_level = ? AND id != ? LIMIT 1`,

      [name, classLevel, id]

    );

    if (duplicate.length) {

      return res.status(409).json({ message: "Another subject with this name already exists for this class" });

    }



    await query(`UPDATE subjects SET name = ? WHERE id = ?`, [name, id]);



    if (oldName !== name) {

      await query(

        `UPDATE courses SET subject = ? WHERE subject = ? AND class_level = ?`,

        [name, oldName, classLevel]

      );

    }



    res.json({ message: "Subject updated", subject: { id, name, classLevel } });

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: "Failed to update subject" });

  }

};



exports.deleteSubject = async (req, res) => {

  const id = Number(req.params.id);



  if (!id) {

    return res.status(400).json({ message: "Invalid subject id" });

  }



  try {

    const rows = await query(

      `SELECT id, name, class_level FROM subjects WHERE id = ? LIMIT 1`,

      [id]

    );

    if (!rows.length) {

      return res.status(404).json({ message: "Subject not found" });

    }



    const { name, class_level: classLevel } = rows[0];



    const linked = await query(

      `SELECT COUNT(*) AS cnt FROM courses

       WHERE subject = ? AND class_level = ?`,

      [name, classLevel]

    );

    const count = Number(linked[0]?.cnt) || 0;



    if (count > 0) {

      return res.status(409).json({

        message: `Cannot delete: ${count} class(es) are linked to this subject. Remove or reassign them first.`,

        linkedCount: count,

      });

    }



    await query(`DELETE FROM subjects WHERE id = ?`, [id]);

    res.json({ message: "Subject deleted" });

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: "Failed to delete subject" });

  }

};



/** Subjects visible to logged-in student: class match + active class with lessons */

exports.getUserSubjects = async (req, res) => {

  try {

    const classLevel = await getUserClassLevel(req.user?.id);



    if (!classLevel) {

      return res.json({ subjects: [], classLevel: "" });

    }



    const rows = await query(

      `SELECT DISTINCT s.id, s.name, s.class_level, s.status

       FROM subjects s

       INNER JOIN courses c

         ON c.subject = s.name AND c.class_level = s.class_level

       WHERE s.status = 'active'

         AND c.status = 'Active'

         AND c.class_level = ?

         AND EXISTS (

           SELECT 1 FROM course_videos v WHERE v.course_id = c.id LIMIT 1

         )

       ORDER BY s.name ASC`,

      [classLevel]

    );



    res.json({

      classLevel,

      subjects: rows.map((r) => r.name),

      items: rows.map(mapSubjectRow),

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: "Failed to fetch user subjects" });

  }

};



exports.ensureSubjectName = async (name, classLevel) => {

  const trimmed = String(name || "").trim();

  const cls = String(classLevel || "").trim();

  if (!trimmed || !cls) return;

  try {

    await query(

      `INSERT IGNORE INTO subjects (name, class_level, status) VALUES (?, ?, 'active')`,

      [trimmed, cls]

    );

  } catch (err) {

    console.error("ensureSubjectName:", err.message);

  }

};

