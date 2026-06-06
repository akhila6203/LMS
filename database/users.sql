-- LMS Students — single users table (login + profile + Google sign-in)
USE lms_project;

DROP TABLE IF EXISTS user_details;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL DEFAULT '',
  google_login TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  bio TEXT NULL,
  avatar LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
