const { clearAuthCookie } = require("../utils/authCookie");
const { loadUserFromToken } = require("../middleware/authMiddleware");

exports.getMe = async (req, res) => {
  try {
    const user = await loadUserFromToken(req);
    return res.json({ user: user || null });
  } catch {
    return res.json({ user: null });
  }
};

exports.logout = (_req, res) => {
  clearAuthCookie(res);
  return res.json({ message: "Logged out successfully" });
};
