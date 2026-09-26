const { isAuthenticated } = require("./_lib/auth");
const { listSubmissions } = require("./_lib/storage");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  try { return res.status(200).json({ submissions: await listSubmissions() }); }
  catch (error) { console.error(error.message); return res.status(503).json({ error: "Storage is not configured yet." }); }
};
