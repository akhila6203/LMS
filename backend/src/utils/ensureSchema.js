const { query } = require("./dbQuery");

/**
 * Ensures DB matches schema.sql — safe to run on every server start.
 * Fixes "Failed to create course" when an old DB is missing class_level/subject columns.
 */
async function columnExists(table, column) {
  const rows = await query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
     LIMIT 1`,
    [table, column]
  );
  return rows.length > 0;
}

async function tableExists(table) {
  const rows = await query(
    `SELECT 1 FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
     LIMIT 1`,
    [table]
  );
  return rows.length > 0;
}

async function ensureCoursesTable() {
  if (!(await tableExists("courses"))) return;

  if (!(await columnExists("courses", "class_level"))) {
    await query(
      `ALTER TABLE courses ADD COLUMN class_level VARCHAR(50) NOT NULL DEFAULT ''
       COMMENT 'Grade / class (e.g. Class 5)' AFTER title`
    );
    if (await columnExists("courses", "category")) {
      await query(
        `UPDATE courses SET class_level = COALESCE(NULLIF(category, ''), class_level)`
      );
    }
  }

  if (!(await columnExists("courses", "subject"))) {
    await query(
      `ALTER TABLE courses ADD COLUMN subject VARCHAR(100) NOT NULL DEFAULT ''
       COMMENT 'Subject (e.g. Maths)' AFTER class_level`
    );
    if (await columnExists("courses", "sub_category")) {
      await query(
        `UPDATE courses SET subject = COALESCE(NULLIF(sub_category, ''), subject)`
      );
    }
  }

  if (!(await columnExists("courses", "overview"))) {
    await query(`ALTER TABLE courses ADD COLUMN overview JSON NULL AFTER description`);
  }
}

async function ensureUsersTable() {
  if (!(await tableExists("users"))) return;

  if (!(await columnExists("users", "class_level"))) {
    await query(
      `ALTER TABLE users ADD COLUMN class_level VARCHAR(50) NOT NULL DEFAULT '' AFTER status`
    );
  }

  if (!(await columnExists("users", "school"))) {
    await query(
      `ALTER TABLE users ADD COLUMN school VARCHAR(255) NOT NULL DEFAULT '' AFTER class_level`
    );
  }

  if (!(await columnExists("users", "google_sub"))) {
    await query(
      `ALTER TABLE users ADD COLUMN google_sub VARCHAR(255) NULL AFTER password`
    );
  }

  if (!(await columnExists("users", "avatar"))) {
    await query(`ALTER TABLE users ADD COLUMN avatar LONGTEXT NULL AFTER school`);
  }

  if (!(await columnExists("users", "last_login_at"))) {
    await query(
      `ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL DEFAULT NULL AFTER avatar`
    );
  }
}

async function ensureSchoolsTable() {
  if (await tableExists("schools")) return;

  await query(`
    CREATE TABLE schools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureSubjectsTable() {
  if (!(await tableExists("subjects"))) {
    await query(`
      CREATE TABLE subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        class_level VARCHAR(50) NOT NULL DEFAULT '',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_subject_class (name, class_level)
      )
    `);
    return;
  }

  if (!(await columnExists("subjects", "status"))) {
    await query(
      `ALTER TABLE subjects ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active' AFTER class_level`
    );
  }

  if (!(await columnExists("subjects", "updated_at"))) {
    await query(
      `ALTER TABLE subjects ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`
    );
  }
}

async function ensureEnrollmentsTable() {
  if (!(await tableExists("course_enrollments"))) return;

  if (!(await columnExists("course_enrollments", "quiz_score"))) {
    await query(
      `ALTER TABLE course_enrollments ADD COLUMN quiz_score INT NULL
       COMMENT 'Correct answers on quiz submit' AFTER quiz_completed_at`
    );
  }

  if (!(await columnExists("course_enrollments", "quiz_total"))) {
    await query(
      `ALTER TABLE course_enrollments ADD COLUMN quiz_total INT NULL
       COMMENT 'Total quiz questions' AFTER quiz_score`
    );
  }
}

async function ensureQuizScoresTable() {
  if (await tableExists("course_quiz_scores")) return;

  await query(`
    CREATE TABLE course_quiz_scores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      enrollment_id INT NOT NULL,
      quiz_id INT NOT NULL,
      quiz_title VARCHAR(255) NOT NULL DEFAULT '',
      score INT NOT NULL DEFAULT 0,
      total INT NOT NULL DEFAULT 0,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_enrollment_quiz (enrollment_id, quiz_id),
      FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES course_quizzes(id) ON DELETE CASCADE
    )
  `);
}

async function ensureSchema() {
  try {
    await ensureSchoolsTable();
    await ensureSubjectsTable();
    await ensureUsersTable();
    await ensureCoursesTable();
    await ensureEnrollmentsTable();
    await ensureQuizScoresTable();
    console.log("Database schema verified");
  } catch (err) {
    console.error("Schema verification failed:", err.message);
  }
}

module.exports = { ensureSchema };
