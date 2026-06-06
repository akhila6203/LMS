-- Student learning stats & invites (requires database/users.sql)
USE lms_project;

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id INT NOT NULL PRIMARY KEY,
  enrolled INT NOT NULL DEFAULT 0,
  completed INT NOT NULL DEFAULT 0,
  progress INT NOT NULL DEFAULT 0,
  joined_date DATE NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_invites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) DEFAULT '',
  invite_token VARCHAR(64) NOT NULL UNIQUE,
  invited_by INT NULL COMMENT 'admins.id',
  status ENUM('pending', 'accepted', 'expired') NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  INDEX idx_student_invites_email (email),
  INDEX idx_student_invites_status (status)
);


ALTER TABLE student_invites
ADD COLUMN accepted_at DATETIME NULL;