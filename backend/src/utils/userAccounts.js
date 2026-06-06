const { query } = require("./dbQuery");

const isGoogleAuth = (reqUser) => reqUser?.authProvider === "google";

const accountMeta = (reqUser) =>
  isGoogleAuth(reqUser)
    ? { table: "google_users", profileTable: "google_student_profiles" }
    : { table: "users", profileTable: "student_profiles" };

const toPublicUser = (row, authProvider) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: "user",
  status: row.status,
  google_login: authProvider === "google" || !!row.google_login,
  authProvider,
});

module.exports = {
  isGoogleAuth,
  accountMeta,
  toPublicUser,
  query,
};
