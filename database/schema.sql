-- LMS fresh install — run this ENTIRE file in MySQL / phpMyAdmin
-- Database: lms_project (class-based learning, no purchase / cart / orders)
-- This is the ONLY database file you need. Do not run separate migration files.

CREATE DATABASE IF NOT EXISTS lms_project
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lms_project;

-- ---------------------------------------------------------------------------
-- Admin & site content
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  bio TEXT NULL,
  avatar LONGTEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url LONGTEXT NOT NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_demo_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  video_url LONGTEXT NOT NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Learners (admin-managed + Google sign-in on same table)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL DEFAULT '',
  google_sub VARCHAR(255) NULL COMMENT 'Google account subject id after first sign-in',
  google_login TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  class_level VARCHAR(50) NOT NULL DEFAULT '',
  school VARCHAR(255) NOT NULL DEFAULT '',
  bio TEXT NULL,
  avatar LONGTEXT NULL,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_google_sub (google_sub)
);

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id INT NOT NULL PRIMARY KEY,
  enrolled INT NOT NULL DEFAULT 0,
  completed INT NOT NULL DEFAULT 0,
  progress INT NOT NULL DEFAULT 0,
  joined_date DATE NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin-managed school names (also used in student dropdown + bulk import)
CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_invites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) DEFAULT '',
  class_level VARCHAR(50) NOT NULL DEFAULT '',
  school VARCHAR(255) NOT NULL DEFAULT '',
  invite_token VARCHAR(64) NOT NULL UNIQUE,
  invited_by INT NULL COMMENT 'admins.id',
  status ENUM('pending', 'accepted', 'expired') NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  accepted_at DATETIME NULL,
  INDEX idx_student_invites_email (email),
  INDEX idx_student_invites_status (status)
);

-- ---------------------------------------------------------------------------
-- Classes (courses) & content
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  class_level VARCHAR(50) NOT NULL DEFAULT '' COMMENT 'Grade / class (e.g. Class 5) — maps to category in API',
  subject VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'Subject (e.g. Maths) — maps to subCategory in API',
  instructor VARCHAR(255) DEFAULT '',
  description TEXT,
  overview JSON NULL COMMENT 'Bullet points shown on course page',
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  thumbnail LONGTEXT,
  created_by INT DEFAULT NULL COMMENT 'admins.id — set from JWT on create',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_courses_status (status),
  INDEX idx_courses_class_level (class_level),
  INDEX idx_courses_subject (subject),
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
  lesson_video_id INT NULL COMMENT 'Optional link to course_videos lesson',
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
  question_type VARCHAR(20) NOT NULL DEFAULT 'radio',
  options JSON NOT NULL,
  correct_index INT NOT NULL DEFAULT 0,
  correct_answers JSON NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES course_quizzes(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Enrollments & progress (free class access — no checkout)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS course_enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  quiz_completed_at TIMESTAMP NULL,
  quiz_score INT NULL COMMENT 'Correct answers on quiz submit',
  quiz_total INT NULL COMMENT 'Total quiz questions',
  status ENUM('pending', 'active', 'completed') NOT NULL DEFAULT 'active',
  UNIQUE KEY uk_user_course (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_lesson_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL,
  lesson_key VARCHAR(255) NOT NULL,
  lesson_type ENUM('video', 'material', 'quiz') NOT NULL DEFAULT 'video',
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_lesson_progress (enrollment_id, lesson_key),
  FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Optional admin workspace settings
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS admin_workspace_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL UNIQUE,
  workspace_name VARCHAR(255) NOT NULL DEFAULT '',
  public_url VARCHAR(255) NOT NULL DEFAULT '',
  default_language VARCHAR(10) NOT NULL DEFAULT 'en',
  timezone VARCHAR(50) NOT NULL DEFAULT 'utc',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_integrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  provider VARCHAR(50) NOT NULL,
  connected TINYINT(1) NOT NULL DEFAULT 0,
  config_json JSON NULL,
  connected_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_admin_provider (admin_id, provider),
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Incremental updates (append new migrations at the end of this file)
-- ---------------------------------------------------------------------------

-- My Learning: track when a learner actually begins lessons (used for Started stats)
-- Safe on fresh installs (column already in CREATE TABLE above); no-op if present.
-- ALTER TABLE course_enrollments
--   MODIFY COLUMN started_at TIMESTAMP NULL
--   COMMENT 'First lesson opened — powers Started count on My Learning';

-- Subject progress for admin student table (per-subject completion from enrollments)
-- CREATE INDEX idx_ce_user_course_status ON course_enrollments (user_id, course_id, status);

-- Quiz import: courses.subject groups learner progress shown in admin Students → Subjects dropdown
-- CREATE INDEX idx_courses_subject ON courses (subject);

-- Vocabulary lookup uses external dictionary API; lesson matches search courses + course_videos.
-- Progress is tracked per topic (video/material) in course_lesson_progress — no schema change needed.
