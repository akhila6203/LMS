-- Google Sign-In learners (separate from admin-managed `users` password accounts)
USE lms_project;

CREATE TABLE IF NOT EXISTS google_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  google_sub VARCHAR(255) NOT NULL COMMENT 'Google account subject id',
  name VARCHAR(255) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL,
  avatar LONGTEXT NULL,
  bio TEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_google_sub (google_sub),
  UNIQUE KEY uq_google_email (email)
);

CREATE TABLE IF NOT EXISTS google_student_profiles (
  user_id INT NOT NULL PRIMARY KEY,
  enrolled INT NOT NULL DEFAULT 0,
  completed INT NOT NULL DEFAULT 0,
  progress INT NOT NULL DEFAULT 0,
  joined_date DATE NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_google_student_user
    FOREIGN KEY (user_id) REFERENCES google_users(id) ON DELETE CASCADE
);
