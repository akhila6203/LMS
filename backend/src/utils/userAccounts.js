const { query } = require("./dbQuery");

const isGoogleAuth = (reqUser) => reqUser?.authProvider === "google";

const accountMeta = () => ({
  table: "users",
  profileTable: "student_profiles",
});

const toPublicUser = (row, authProvider) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: "user",
  status: row.status,
  classLevel: row.class_level || "",
  school: row.school || "",
  google_login: authProvider === "google" || !!row.google_login,
  authProvider,
});

module.exports = {
  isGoogleAuth,
  accountMeta,
  toPublicUser,
  query,
};
