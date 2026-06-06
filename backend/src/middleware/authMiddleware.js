const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Login required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    next();
  });
};

const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.role !== "user") {
      return res.status(403).json({ message: "User access only" });
    }
    next();
  });
};

module.exports = { verifyToken, verifyAdmin, verifyUser };
