const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { query } = require("../utils/dbQuery");
const { toPublicUser } = require("../utils/userAccounts");
const { toPublicAdmin } = require("../utils/authUsers");
const { getTokenFromRequest } = require("../utils/authCookie");

const fetchAdminById = (id) =>
  new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM admins WHERE id = ? LIMIT 1",
      [id],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0] || null);
      }
    );
  });

const fetchUserById = async (id) => {
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
};

const loadUserFromToken = async (req) => {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }

  if (!decoded?.id || !decoded?.role) return null;

  if (decoded.role === "admin") {
    const admin = await fetchAdminById(decoded.id);
    if (!admin || admin.status !== "active") return null;
    return toPublicAdmin(admin);
  }

  if (decoded.role === "user") {
    const user = await fetchUserById(decoded.id);
    if (!user || user.status !== "active") return null;
    return toPublicUser(user, decoded.authProvider || (user.google_login ? "google" : "password"));
  }

  return null;
};

const verifyToken = async (req, res, next) => {
  try {
    const user = await loadUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Login required" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    const user = await loadUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Login required" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const user = await loadUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: "Login required" });
    }
    if (user.role !== "user") {
      return res.status(403).json({ message: "User access only" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const loadOptionalUser = async (req, _res, next) => {
  try {
    const user = await loadUserFromToken(req);
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyUser,
  loadUserFromToken,
  loadOptionalUser,
};
