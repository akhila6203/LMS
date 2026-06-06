// const { query } = require("../utils/dbQuery");

// const INTEGRATION_PROVIDERS = [
//   "slack",
//   "zoom",
//   "stripe",
//   "google_drive",
//   "mailchimp",
//   "webhooks",
// ];

// const DEFAULT_WORKSPACE = {
//   workspaceName: "LearnHub",
//   publicUrl: "learnhub.app",
//   defaultLanguage: "en",
//   timezone: "utc",
// };

// const dbErrorMessage = (err) => {
//   if (err?.code === "ER_NO_SUCH_TABLE") {
//     return "Run database/workspace_settings.sql in phpMyAdmin to create workspace tables.";
//   }
//   return err?.message || "Database error";
// };

// const toWorkspace = (row) => ({
//   workspaceName: row.workspace_name || "",
//   publicUrl: row.public_url || "",
//   defaultLanguage: row.default_language || "en",
//   timezone: row.timezone || "utc",
//   updatedAt: row.updated_at,
// });

// async function ensureWorkspaceRow(adminId) {
//   const rows = await query(
//     `SELECT * FROM admin_workspace_settings WHERE admin_id = ? LIMIT 1`,
//     [adminId]
//   );
//   if (rows.length) return rows[0];

//   await query(
//     `INSERT INTO admin_workspace_settings
//       (admin_id, workspace_name, public_url, default_language, timezone)
//      VALUES (?, ?, ?, ?, ?)`,
//     [
//       adminId,
//       DEFAULT_WORKSPACE.workspaceName,
//       DEFAULT_WORKSPACE.publicUrl,
//       DEFAULT_WORKSPACE.defaultLanguage,
//       DEFAULT_WORKSPACE.timezone,
//     ]
//   );

//   const created = await query(
//     `SELECT * FROM admin_workspace_settings WHERE admin_id = ? LIMIT 1`,
//     [adminId]
//   );
//   return created[0];
// }

// async function ensureIntegrationRows(adminId) {
//   for (const provider of INTEGRATION_PROVIDERS) {
//     await query(
//       `INSERT IGNORE INTO admin_integrations (admin_id, provider, connected)
//        VALUES (?, ?, 0)`,
//       [adminId, provider]
//     );
//   }
// }

// exports.getWorkspace = async (req, res) => {
//   try {
//     const row = await ensureWorkspaceRow(req.user.id);
//     res.json({ workspace: toWorkspace(row) });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: dbErrorMessage(err) });
//   }
// };

// exports.updateWorkspace = async (req, res) => {
//   const { workspaceName, publicUrl, defaultLanguage, timezone } = req.body;

//   if (!workspaceName?.trim()) {
//     return res.status(400).json({ message: "Workspace name is required" });
//   }

//   const langs = ["en", "es", "fr", "de"];
//   const zones = ["utc", "pst", "est", "ist"];
//   const lang = langs.includes(defaultLanguage) ? defaultLanguage : "en";
//   const tz = zones.includes(timezone) ? timezone : "utc";

//   try {
//     await query(
//       `INSERT INTO admin_workspace_settings
//         (admin_id, workspace_name, public_url, default_language, timezone)
//        VALUES (?, ?, ?, ?, ?)
//        ON DUPLICATE KEY UPDATE
//          workspace_name = VALUES(workspace_name),
//          public_url = VALUES(public_url),
//          default_language = VALUES(default_language),
//          timezone = VALUES(timezone)`,
//       [
//         req.user.id,
//         workspaceName.trim(),
//         (publicUrl || "").trim(),
//         lang,
//         tz,
//       ]
//     );

//     const rows = await query(
//       `SELECT * FROM admin_workspace_settings WHERE admin_id = ? LIMIT 1`,
//       [req.user.id]
//     );

//     res.json({
//       message: "Workspace saved",
//       workspace: toWorkspace(rows[0]),
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: dbErrorMessage(err) });
//   }
// };

// exports.getIntegrations = async (req, res) => {
//   try {
//     await ensureIntegrationRows(req.user.id);

//     const rows = await query(
//       `SELECT provider, connected, connected_at, updated_at
//        FROM admin_integrations
//        WHERE admin_id = ?
//        ORDER BY FIELD(provider, ${INTEGRATION_PROVIDERS.map(() => "?").join(", ")})`,
//       [req.user.id, ...INTEGRATION_PROVIDERS]
//     );

//     const integrations = INTEGRATION_PROVIDERS.map((provider) => {
//       const row = rows.find((r) => r.provider === provider);
//       return {
//         provider,
//         connected: !!row?.connected,
//         connectedAt: row?.connected_at || null,
//       };
//     });

//     res.json({ integrations });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: dbErrorMessage(err) });
//   }
// };

// exports.updateIntegration = async (req, res) => {
//   const { provider } = req.params;
//   const { connected } = req.body;

//   if (!INTEGRATION_PROVIDERS.includes(provider)) {
//     return res.status(400).json({ message: "Unknown integration provider" });
//   }

//   if (typeof connected !== "boolean") {
//     return res.status(400).json({ message: "connected must be true or false" });
//   }

//   try {
//     await ensureIntegrationRows(req.user.id);

//     await query(
//       `INSERT INTO admin_integrations (admin_id, provider, connected, connected_at)
//        VALUES (?, ?, ?, ?)
//        ON DUPLICATE KEY UPDATE
//          connected = VALUES(connected),
//          connected_at = IF(VALUES(connected) = 1, NOW(), NULL)`,
//       [req.user.id, provider, connected ? 1 : 0, connected ? new Date() : null]
//     );

//     const rows = await query(
//       `SELECT provider, connected, connected_at FROM admin_integrations
//        WHERE admin_id = ? AND provider = ? LIMIT 1`,
//       [req.user.id, provider]
//     );

//     res.json({
//       message: connected ? "Integration connected" : "Integration disconnected",
//       integration: {
//         provider: rows[0].provider,
//         connected: !!rows[0].connected,
//         connectedAt: rows[0].connected_at || null,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: dbErrorMessage(err) });
//   }
// };
