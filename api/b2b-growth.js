const { insertSubmission } = require("./_lib/storage");

const REQUIRED = ["companyName", "websiteUrl", "industry", "primaryGoals", "hasRunAds", "monthlyAdSpend", "platforms", "monthlyLeads", "challenges", "wantsAudit"];
const clean = (value) => Array.isArray(value) ? value.map(clean) : String(value || "").trim().slice(0, 3000);
const hasValue = (value) => Array.isArray(value) ? value.length > 0 : Boolean(value);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = req.body || {};
  if (body.company) return res.status(200).json({ ok: true });
  const answers = Object.fromEntries(Object.entries(body).filter(([key]) => key !== "company").map(([key, value]) => [key, clean(value)]));
  if (answers.websiteUrl && !/^https?:\/\//i.test(answers.websiteUrl)) answers.websiteUrl = `https://${answers.websiteUrl}`;
  if (REQUIRED.some((field) => !hasValue(answers[field]))) return res.status(400).json({ error: "Please complete all required questions." });
  try { new URL(answers.websiteUrl); } catch { return res.status(400).json({ error: "Please enter a valid website URL." }); }
  if (!Array.isArray(answers.primaryGoals) || answers.primaryGoals.length > 2) return res.status(400).json({ error: "Select one or two primary marketing goals." });
  if (!Array.isArray(answers.challenges) || answers.challenges.length > 2) return res.status(400).json({ error: "Select one or two marketing challenges." });
  if (!Array.isArray(answers.platforms)) answers.platforms = [answers.platforms];
  if (answers.wantsAudit === "Yes") {
    if (!answers.contactName || !/^[+()\-\s0-9]{7,20}$/.test(answers.whatsapp || "") || !answers.accountToAudit) {
      return res.status(400).json({ error: "Please complete the free-audit contact details." });
    }
  }
  try {
    const saved = await insertSubmission({
      form_type: "b2b_growth_review",
      contact_name: answers.contactName || null,
      contact_email: null,
      contact_phone: answers.whatsapp || null,
      answers,
    });
    return res.status(200).json({ ok: true, id: saved.id });
  } catch (error) {
    console.error("B2B growth form failed:", error.message);
    return res.status(503).json({ error: "We could not record your response right now. Please try again." });
  }
};
