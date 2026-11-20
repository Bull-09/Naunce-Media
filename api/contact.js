const { insertSubmission } = require("./_lib/storage");

const clean = (value) => Array.isArray(value) ? value.map(clean).slice(0, 12) : String(value || "").trim().slice(0, 3000);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\-\s0-9]{7,20}$/;

// Which fields each website form must send. Anything else is stored as-is.
const FORMS = {
  call: { type: "website_call", required: ["name", "business", "email"] },
  contact: { type: "website_contact", required: ["name", "business", "email"] },
  creator: { type: "website_creator", required: ["name", "email", "phone"] },
  careers: { type: "website_careers", required: ["name", "email", "role"] },
};

const LABELS = { name: "your name", business: "your brand", email: "your email", phone: "your phone", role: "the role" };

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = req.body || {};
  if (body.company) return res.status(200).json({ ok: true }); // honeypot: bots fill hidden fields

  const form = FORMS[body.form] ? body.form : "contact";
  const spec = FORMS[form];

  const answers = {};
  Object.entries(body).forEach(([key, value]) => {
    if (key === "company" || key === "form") return;
    answers[key] = clean(value);
  });
  if (answers.svc && !Array.isArray(answers.svc)) answers.svc = [answers.svc];
  if (answers.business) answers.brandName = answers.business;

  const missing = spec.required.filter((k) => !answers[k]);
  if (missing.length) return res.status(400).json({ error: `Please add ${missing.map((k) => LABELS[k] || k).join(", ")}.` });
  if (!EMAIL.test(answers.email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (answers.phone && !PHONE.test(answers.phone)) return res.status(400).json({ error: "Please enter a valid phone or WhatsApp number." });

  try {
    const saved = await insertSubmission({
      form_type: spec.type,
      contact_name: answers.name,
      contact_email: answers.email,
      contact_phone: answers.phone || null,
      answers,
    });
    return res.status(200).json({ ok: true, id: saved.id });
  } catch (error) {
    console.error(`Website ${form} form failed:`, error.message);
    return res.status(503).json({ error: "We could not record your request right now." });
  }
};
