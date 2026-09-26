const { clearCookie } = require("./_lib/auth");
module.exports = function handler(req, res) {
  res.setHeader("Set-Cookie", clearCookie());
  return res.status(200).json({ ok: true });
};
