const nodemailer = require("nodemailer");
const { insertSubmission } = require("./_lib/supabase");

const REQUIRED = ["blinkitRole", "businessPriority", "primaryKpi", "purchaseMode", "sellerHubAccess", "contactName", "contactEmail"];
const RANKS = ["rankRevenue", "rankDiscovery", "rankLaunches", "rankCompetition", "rankStock", "rankVisibility"];

function escapeHtml(value = "") { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function clean(value) { return Array.isArray(value) ? value.map(clean) : String(value || "").trim(); }

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const body = req.body || {};
  if (body.website) return res.status(200).json({ ok: true });
  if (REQUIRED.some((field) => !clean(body[field])) || !/^\S+@\S+\.\S+$/.test(clean(body.contactEmail))) return res.status(400).json({ error: "Please complete the required fields." });
  const ranks = RANKS.map((key) => clean(body[key]));
  if (ranks.some((rank) => !/^[1-6]$/.test(rank)) || new Set(ranks).size !== 6) return res.status(400).json({ error: "Please provide a unique rank for each priority." });
  const response = Object.fromEntries(Object.entries(body).filter(([key]) => key !== "website").map(([key, value]) => [key, clean(value)]));
  try {
    await insertSubmission({ form_type: "zebralearn_blinkit", contact_name: response.contactName, contact_email: response.contactEmail, contact_phone: response.contactPhone || null, answers: response });
    const smtpUser = process.env.SMTP_USER, smtpPassword = process.env.SMTP_PASSWORD, recipient = process.env.ZEBRALEARN_QUESTIONNAIRE_TO || smtpUser;
    if (smtpUser && smtpPassword && recipient) {
      const rows = Object.entries(response).map(([key, value]) => `<tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:700">${escapeHtml(key)}</td><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(Array.isArray(value) ? value.join(", ") : value).replaceAll("\n", "<br>")}</td></tr>`).join("");
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST || "smtp.hostinger.com", port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT || 587) === 465, auth: { user: smtpUser, pass: smtpPassword } });
      await transporter.sendMail({ from: `"Nuance Media" <${smtpUser}>`, to: recipient, replyTo: response.contactEmail, subject: `ZebraLearn Blinkit questionnaire — ${response.contactName}`, html: `<h2>New ZebraLearn × Blinkit questionnaire</h2><table style="border-collapse:collapse">${rows}</table>` });
    }
    return res.status(200).json({ ok: true });
  } catch (error) { console.error("ZebraLearn questionnaire failed:", error.message); return res.status(500).json({ error: "Unable to save questionnaire" }); }
};
