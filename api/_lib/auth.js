const crypto = require("crypto");

const PASSWORD_SALT = "52de293633ae9111632d34c25651ea2d";
const PASSWORD_HASH = "e4bc31e6c91e5437b57d765e6c6cf7e9e98b2a68ed73779560ddc1537c5e8463";
const COOKIE_NAME = "nm_admin_session";
const SESSION_TTL = 8 * 60 * 60;

function passwordMatches(password) {
  const candidate = crypto.pbkdf2Sync(String(password || ""), PASSWORD_SALT, 210000, 32, "sha256");
  return crypto.timingSafeEqual(candidate, Buffer.from(PASSWORD_HASH, "hex"));
}

function signature(payload) {
  return crypto.createHmac("sha256", PASSWORD_HASH).update(payload).digest("base64url");
}

function createSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

function readCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || "").split(";").map((part) => part.trim().split(/=(.*)/s).slice(0, 2)).filter(([key]) => key));
}

function isAuthenticated(req) {
  const token = readCookies(req)[COOKIE_NAME];
  if (!token) return false;
  const [payload, supplied] = token.split(".");
  if (!payload || !supplied) return false;
  const expected = signature(payload);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Math.floor(Date.now() / 1000); } catch { return false; }
}

function sessionCookie(token) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL}`;
}

function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

module.exports = { passwordMatches, createSession, isAuthenticated, sessionCookie, clearCookie };
