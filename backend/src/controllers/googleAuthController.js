const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { query } = require("../utils/dbQuery");
const { toPublicUser } = require("../utils/userAccounts");
const { syncStudentProfileProgress } = require("../utils/progressHelpers");

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const client = new OAuth2Client(googleClientId);

async function syncStudentStats(userId) {
  return syncStudentProfileProgress(userId);
}

async function ensureStudentProfile(userId) {
  const rows = await query(
    `SELECT user_id FROM student_profiles WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (!rows.length) {
    await query(
      `INSERT INTO student_profiles (user_id, enrolled, completed, progress, joined_date)
       VALUES (?, 0, 0, 0, CURDATE())`,
      [userId]
    );
  }
}

exports.googleLogin = async (req, res) => {
  if (!googleClientId) {
    return res.status(500).json({
      message: "Google login is not configured (set GOOGLE_CLIENT_ID in backend .env)",
    });
  }

  try {
    const { token, inviteToken } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const googleSub = payload.sub;
    const email = payload.email?.trim().toLowerCase();
    const name = payload.name || payload.given_name || "Learner";
    const avatar = payload.picture || null;

    let invite = null;

    if (!googleSub || !email) {
      return res.status(400).json({ message: "Google account email is required" });
    }

    if (!email.endsWith("@gmail.com")) {
      return res.status(403).json({
        message:
          "Only Gmail accounts are allowed. Please sign in with your registered Gmail address.",
      });
    }

    if (inviteToken) {
      const inviteRows = await query(
        `SELECT * FROM student_invites
         WHERE invite_token = ?
         LIMIT 1`,
        [inviteToken]
      );

      if (!inviteRows.length) {
        return res.status(400).json({ message: "Invalid invite link" });
      }

      invite = inviteRows[0];

      if (invite.status !== "pending") {
        return res.status(400).json({ message: "Invite already used or expired" });
      }

      if (new Date(invite.expires_at).getTime() < Date.now()) {
        await query(
          `UPDATE student_invites SET status = 'expired' WHERE id = ?`,
          [invite.id]
        );
        return res.status(400).json({ message: "Invite link expired" });
      }

      if (invite.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({
          message: "Please login with the invited email address",
        });
      }
    }

    let registeredRows = await query(
      `SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [email]
    );

    if (!invite && !registeredRows.length) {
      return res.status(403).json({
        message:
          "This Gmail account is not registered. Ask your admin to add your email in Students.",
      });
    }

    if (registeredRows.length && registeredRows[0].status !== "active") {
      return res.status(403).json({
        message: "Your account is inactive. Contact your admin.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "lms_secret_key";

    let assignedClassLevel = "";
    let assignedSchool = "";
    if (invite?.class_level) {
      assignedClassLevel = String(invite.class_level).trim();
    } else if (registeredRows.length) {
      assignedClassLevel = String(registeredRows[0]?.class_level || "").trim();
    }

    if (invite?.school) {
      assignedSchool = String(invite.school).trim();
    } else if (registeredRows.length) {
      assignedSchool = String(registeredRows[0]?.school || "").trim();
    }

    let user;

    if (registeredRows.length) {
      user = registeredRows[0];

      await query(
        `UPDATE users
         SET google_sub = ?, name = ?, email = ?, avatar = COALESCE(?, avatar),
             google_login = 1,
             class_level = COALESCE(NULLIF(?, ''), class_level),
             school = COALESCE(NULLIF(?, ''), school),
             last_login_at = NOW()
         WHERE id = ?`,
        [googleSub, name, email, avatar, assignedClassLevel, assignedSchool, user.id]
      );

      user = {
        ...user,
        google_sub: googleSub,
        name,
        email,
        avatar: avatar || user.avatar,
        google_login: 1,
        class_level: assignedClassLevel || user.class_level || "",
        school: assignedSchool || user.school || "",
      };
    } else if (invite) {
      const insert = await query(
        `INSERT INTO users
          (name, email, password, google_sub, google_login, status, class_level, school, avatar, last_login_at)
         VALUES (?, ?, '', ?, 1, 'active', ?, ?, ?, NOW())`,
        [invite.name || name, email, googleSub, assignedClassLevel, assignedSchool, avatar]
      );

      const newId = insert.insertId;
      await ensureStudentProfile(newId);

      const created = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [newId]);
      user = created[0];
    }

    await ensureStudentProfile(user.id);
    await syncStudentStats(user.id);

    if (invite) {
      await query(
        `UPDATE student_invites
         SET status = 'accepted', accepted_at = NOW()
         WHERE id = ?`,
        [invite.id]
      );
    }

    const jwtToken = jwt.sign(
      { id: user.id, role: "user", authProvider: "google" },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      token: jwtToken,
      user: toPublicUser(user, "google"),
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ message: "Google login failed" });
  }
};
