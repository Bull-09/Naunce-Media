const { insertSubmission } = require("./_lib/storage");

const REQUIRED = ["businessName", "websiteOrInstagram", "businessType", "location", "primaryGoals", "monthlyAdSpend", "marketingChannels", "challenges", "successMetrics", "wantsAudit"];
const clean = (value) => Array.isArray(value) ? value.map(clean) : String(value || "").trim().slice(0, 3000);
const hasValue = (value) => Array.isArray(value) ? value.length > 0 : Boolean(value);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = req.body || {};
  if (body.company) return res.status(200).json({ ok: true });
  const answers = Object.fromEntries(Object.entries(body).filter(([key]) => key !== "company").map(([key, value]) => [key, clean(value)]));
  if (answers.websiteOrInstagram && !/^https?:\/\//i.test(answers.websiteOrInstagram)) answers.websiteOrInstagram = `https://${answers.websiteOrInstagram}`;
  if (REQUIRED.some((field) => !hasValue(answers[field]))) return res.status(400).json({ error: "Please complete all required questions." });
  try { new URL(answers.websiteOrInstagram); } catch { return res.status(400).json({ error: "Please enter a valid website or Instagram address." }); }
  for (const field of ["primaryGoals", "challenges", "successMetrics"]) {
    if (!Array.isArray(answers[field]) || answers[field].length > 3) return res.status(400).json({ error: "Select between one and three options for each priority question." });
  }
  if (!Array.isArray(answers.marketingChannels)) answers.marketingChannels = [answers.marketingChannels];
  if (answers.wantsAudit === "Yes") {
    if (!answers.contactName || !/^[+()\-\s0-9]{7,20}$/.test(answers.whatsapp || "") || !answers.accountToAudit) {
      return res.status(400).json({ error: "Please complete the free-audit contact details." });
    }
  }
  try {
    const saved = await insertSubmission({
      form_type: "local_business_growth",
      contact_name: answers.contactName || null,
      contact_email: null,
      contact_phone: answers.whatsapp || null,
      answers,
    });
    return res.status(200).json({ ok: true, id: saved.id });
  } catch (error) {
    console.error("Local business growth form failed:", error.message);
    return res.status(503).json({ error: "We could not record your response right now. Please try again." });
  }
};
