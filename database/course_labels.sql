-- Course labels (difficulty + marketing tags) — multi-select from admin Step 1
USE lms_project;

ALTER TABLE courses
  ADD COLUMN labels JSON NULL COMMENT 'e.g. ["Popular","Trending","Beginner"]'
  AFTER level;
