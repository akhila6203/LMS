-- Pricing, purchases, enrollments, and lesson progress
USE lms_project;

-- Run once; ignore duplicate-column errors if re-running
ALTER TABLE courses ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER students;
ALTER TABLE courses ADD COLUMN discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0 AFTER price;
ALTER TABLE courses
ADD COLUMN overview LONGTEXT NULL;

CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_user_course(user_id, course_id),

    FOREIGN KEY (course_id)
    REFERENCES courses(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  account_type ENUM('password', 'google') NOT NULL DEFAULT 'google',
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  receipt_url TEXT,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  verified_by INT DEFAULT NULL,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_status (status),
  INDEX idx_orders_user (user_id, account_type),
  CONSTRAINT fk_orders_verified_by FOREIGN KEY (verified_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  course_id INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  line_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  account_type ENUM('password', 'google') NOT NULL DEFAULT 'google',
  course_id INT NOT NULL,
  order_id INT DEFAULT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  quiz_completed_at TIMESTAMP NULL,
  status ENUM('pending', 'active', 'completed') NOT NULL DEFAULT 'active',
  UNIQUE KEY uk_user_course (user_id, account_type, course_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL
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
