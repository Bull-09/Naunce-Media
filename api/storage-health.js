const { checkStorage } = require("./_lib/storage");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false });
  try {
    const provider = await checkStorage();
    return res.status(200).json({ ok: true, provider });
  } catch (error) {
    console.error("Storage health check failed:", error.message);
    return res.status(503).json({ ok: false, error: "storage_unavailable" });
  }
};
