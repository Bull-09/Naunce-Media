const { insertSubmission } = require("./_lib/storage");

const REQUIRED = ["brandName", "websiteUrl", "primaryGoal", "monthlyAdSpend", "platforms", "roas", "aov", "monthlyOrders", "bottlenecks", "wantsAudit"];
const clean = (value) => Array.isArray(value) ? value.map(clean) : String(value || "").trim().slice(0, 3000);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = req.body || {};
  if (body.company) return res.status(200).json({ ok: true });
  const answers = Object.fromEntries(Object.entries(body).filter(([key]) => key !== "company").map(([key, value]) => [key, clean(value)]));
  if (answers.websiteUrl && !/^https?:\/\//i.test(answers.websiteUrl)) answers.websiteUrl = `https://${answers.websiteUrl}`;
  if (REQUIRED.some((field) => !answers[field])) return res.status(400).json({ error: "Please complete all required questions." });
  try { new URL(answers.websiteUrl); } catch { return res.status(400).json({ error: "Please enter a valid website URL." }); }
  if (answers.wantsAudit === "Yes") {
    if (!answers.contactName || !/^[+()\-\s0-9]{7,20}$/.test(answers.whatsapp || "") || !answers.metaAccountId) return res.status(400).json({ error: "Please complete the free-audit contact details." });
  }
  try {
    const saved = await insertSubmission({
      form_type: "ecommerce_growth_audit",
      contact_name: answers.contactName || null,
      contact_email: null,
      contact_phone: answers.whatsapp || null,
      answers,
    });
    return res.status(200).json({ ok: true, id: saved.id });
  } catch (error) {
    console.error("Growth audit failed:", error.message);
    return res.status(503).json({ error: "The form is ready, but storage has not been connected yet." });
  }
};
