const { passwordMatches, createSession, sessionCookie } = require("./_lib/auth");

module.exports = function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!passwordMatches(req.body?.password)) return res.status(401).json({ error: "Incorrect password" });
  res.setHeader("Set-Cookie", sessionCookie(createSession()));
  return res.status(200).json({ ok: true });
};
