-- Per-user course wishlist (password users + Google sign-in)
USE lms_project;

CREATE TABLE IF NOT EXISTS user_wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  account_type VARCHAR(32) NOT NULL COMMENT 'users or google_users',
  course_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_wishlist (user_id, account_type, course_id),
  INDEX idx_wishlist_user (user_id, account_type),
  CONSTRAINT fk_wishlist_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
