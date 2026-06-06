-- Courses (requires database/admin.sql for created_by)
USE lms_project;

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT '',
  sub_category VARCHAR(100) DEFAULT '',
  subject VARCHAR(100) DEFAULT '',
  class_level VARCHAR(50) DEFAULT '',
  instructor VARCHAR(255) DEFAULT '',
  level VARCHAR(50) DEFAULT 'Beginner',
  labels JSON NULL COMMENT 'Difficulty + marketing tags from admin',
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  students INT NOT NULL DEFAULT 0,
  thumbnail LONGTEXT,
  created_by INT DEFAULT NULL COMMENT 'admins.id — set from JWT on create',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_courses_status (status),
  CONSTRAINT fk_courses_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS course_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  url TEXT,
  duration VARCHAR(50) DEFAULT '',
  sort_order INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'PDF',
  url TEXT,
  sort_order INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  quiz_title VARCHAR(255) NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question TEXT NOT NULL,
  options JSON NOT NULL,
  correct_index INT NOT NULL DEFAULT 0,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES course_quizzes(id) ON DELETE CASCADE
);
