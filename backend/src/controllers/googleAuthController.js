const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { query } = require("../utils/dbQuery");
const { toPublicUser } = require("../utils/userAccounts");

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const client = new OAuth2Client(googleClientId);

async function syncGoogleStudentStats(userId) {
  try {
    const enrolledRows = await query(
      `SELECT COUNT(*) AS c FROM course_enrollments
       WHERE user_id = ? AND account_type = 'google'`,
      [userId]
    );
    const completedRows = await query(
      `SELECT COUNT(*) AS c FROM course_enrollments
       WHERE user_id = ? AND account_type = 'google' AND status = 'completed'`,
      [userId]
    );
    const enrolled = Number(enrolledRows[0]?.c) || 0;
    const completed = Number(completedRows[0]?.c) || 0;
    const progress =
      enrolled > 0 ? Math.min(100, Math.round((completed / enrolled) * 100)) : 0;

    await query(
      `UPDATE google_student_profiles
       SET enrolled = ?, completed = ?, progress = ?
       WHERE user_id = ?`,
      [enrolled, completed, progress, userId]
    );
  } catch (err) {
    console.error("syncGoogleStudentStats:", err);
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

    const jwtSecret = process.env.JWT_SECRET || "lms_secret_key";

    let rows = await query(
      "SELECT * FROM google_users WHERE google_sub = ? OR email = ? LIMIT 1",
      [googleSub, email]
    );

    let user = rows[0];

    if (user) {
      if (user.status !== "active") {
        return res.status(403).json({
          message: "Your account is inactive. Contact support.",
        });
      }

      await query(
        `UPDATE google_users
         SET google_sub = ?, name = ?, email = ?, avatar = COALESCE(?, avatar), last_login_at = NOW()
         WHERE id = ?`,
        [googleSub, name, email, avatar, user.id]
      );

      user = {
        ...user,
        google_sub: googleSub,
        name,
        email,
        avatar: avatar || user.avatar,
      };

      await syncGoogleStudentStats(user.id);
    } else {
      const insert = await query(
        `INSERT INTO google_users (google_sub, name, email, avatar, status, last_login_at)
         VALUES (?, ?, ?, ?, 'active', NOW())`,
        [googleSub, name, email, avatar]
      );

      const newId = insert.insertId;

      await query(
        `INSERT INTO google_student_profiles (user_id, enrolled, completed, progress, joined_date)
         VALUES (?, 0, 0, 0, CURDATE())`,
        [newId]
      );

      const created = await query("SELECT * FROM google_users WHERE id = ? LIMIT 1", [
        newId,
      ]);
      user = created[0];
    }

    await syncGoogleStudentStats(user.id);

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


// const jwt = require("jsonwebtoken");
// const { OAuth2Client } = require("google-auth-library");
// const { query } = require("../utils/dbQuery");
// const { toPublicUser } = require("../utils/userAccounts");

// const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
// const client = new OAuth2Client(googleClientId);

// async function syncGoogleStudentStats(userId) {
//   try {
//     const enrolledRows = await query(
//       `SELECT COUNT(*) AS c FROM course_enrollments
//        WHERE user_id = ? AND account_type = 'google'`,
//       [userId]
//     );
//     const completedRows = await query(
//       `SELECT COUNT(*) AS c FROM course_enrollments
//        WHERE user_id = ? AND account_type = 'google' AND status = 'completed'`,
//       [userId]
//     );
//     const enrolled = Number(enrolledRows[0]?.c) || 0;
//     const completed = Number(completedRows[0]?.c) || 0;
//     const progress =
//       enrolled > 0 ? Math.min(100, Math.round((completed / enrolled) * 100)) : 0;

//     await query(
//       `UPDATE google_student_profiles
//        SET enrolled = ?, completed = ?, progress = ?
//        WHERE user_id = ?`,
//       [enrolled, completed, progress, userId]
//     );
//   } catch (err) {
//     console.error("syncGoogleStudentStats:", err);
//   }
// }

// exports.googleLogin = async (req, res) => {
//   if (!googleClientId) {
//     return res.status(500).json({
//       message: "Google login is not configured (set GOOGLE_CLIENT_ID in backend .env)",
//     });
//   }

//   try {
//     const { token } = req.body;
//     if (!token) {
//       return res.status(400).json({ message: "Google token is required" });
//     }

//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: googleClientId,
//     });

//     const payload = ticket.getPayload();
//     const googleSub = payload.sub;
//     const email = payload.email?.trim().toLowerCase();
//     const name = payload.name || payload.given_name || "Learner";
//     const avatar = payload.picture || null;

//     if (!googleSub || !email) {
//       return res.status(400).json({ message: "Google account email is required" });
//     }

//     const jwtSecret = process.env.JWT_SECRET || "lms_secret_key";

//     let rows = await query(
//       "SELECT * FROM google_users WHERE google_sub = ? OR email = ? LIMIT 1",
//       [googleSub, email]
//     );

//     let user = rows[0];

//     if (user) {
//       if (user.status !== "active") {
//         return res.status(403).json({
//           message: "Your account is inactive. Contact support.",
//         });
//       }

//       await query(
//         `UPDATE google_users
//          SET google_sub = ?, name = ?, email = ?, avatar = COALESCE(?, avatar), last_login_at = NOW()
//          WHERE id = ?`,
//         [googleSub, name, email, avatar, user.id]
//       );

//       user = {
//         ...user,
//         google_sub: googleSub,
//         name,
//         email,
//         avatar: avatar || user.avatar,
//       };

//       await syncGoogleStudentStats(user.id);
//     } else {
//       const insert = await query(
//         `INSERT INTO google_users (google_sub, name, email, avatar, status, last_login_at)
//          VALUES (?, ?, ?, ?, 'active', NOW())`,
//         [googleSub, name, email, avatar]
//       );

//       const newId = insert.insertId;

//       await query(
//         `INSERT INTO google_student_profiles (user_id, enrolled, completed, progress, joined_date)
//          VALUES (?, 0, 0, 0, CURDATE())`,
//         [newId]
//       );

//       const created = await query("SELECT * FROM google_users WHERE id = ? LIMIT 1", [
//         newId,
//       ]);
//       user = created[0];
//     }

//     await syncGoogleStudentStats(user.id);

//     const jwtToken = jwt.sign(
//       { id: user.id, role: "user", authProvider: "google" },
//       jwtSecret,
//       { expiresIn: "7d" }
//     );

//     return res.json({
//       token: jwtToken,
//       user: toPublicUser(user, "google"),
//     });
//   } catch (error) {
//     console.error("Google login error:", error);
//     return res.status(500).json({ message: "Google login failed" });
//   }
// };
