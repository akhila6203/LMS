const jwt = require("jsonwebtoken");

const COOKIE_NAME = "token";

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

const buildToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

const setAuthCookie = (res, payload) => {
  const token = buildToken(payload);
  res.cookie(COOKIE_NAME, token, getCookieOptions());
  return token;
};

const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

const getTokenFromRequest = (req) => req.cookies?.[COOKIE_NAME] || null;

module.exports = {
  COOKIE_NAME,
  buildToken,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
  getCookieOptions,
};
