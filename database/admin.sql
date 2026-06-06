-- LMS Admin — single admins table (only file needed for admin accounts)
USE lms_project;

DROP TABLE IF EXISTS admin_details;

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


CREATE TABLE banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url LONGTEXT NOT NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE home_demo_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  video_url LONGTEXT NOT NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);