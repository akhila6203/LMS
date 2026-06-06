-- Run once in phpMyAdmin (lms_project) to remove old/unused schema
USE lms_project;

DROP TABLE IF EXISTS user_details;
DROP TABLE IF EXISTS admin_details;

-- Remove obsolete columns (ignore error if already dropped)
ALTER TABLE users DROP COLUMN role;
ALTER TABLE admins DROP COLUMN google_login;
