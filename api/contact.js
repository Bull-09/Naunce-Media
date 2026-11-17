const { insertSubmission } = require("./_lib/storage");

const clean = (value) => Array.isArray(value) ? value.map(clean).slice(0, 10) : String(value || "").trim().slice(0, 3000);

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = req.body || {};
  if (body.company) return res.status(200).json({ ok: true }); // honeypot: bots fill hidden fields

  const answers = {
    name: clean(body.name),
    brandName: clean(body.business),
    email: clean(body.email),
    phone: clean(body.phone),
    businessType: clean(body.type),
    monthlyAdBudget: clean(body.budget),
    services: Array.isArray(body.svc) ? clean(body.svc) : (body.svc ? [clean(body.svc)] : []),
    message: clean(body.message),
    page: clean(body.page),
  };

  if (!answers.name || !answers.brandName || !answers.email) {
    return res.status(400).json({ error: "Please add your name, brand and email." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (answers.phone && !/^[+()\-\s0-9]{7,20}$/.test(answers.phone)) {
    return res.status(400).json({ error: "Please enter a valid phone or WhatsApp number." });
  }

  try {
    const saved = await insertSubmission({
      form_type: "website_contact",
      contact_name: answers.name,
      contact_email: answers.email,
      contact_phone: answers.phone || null,
      answers,
    });
    return res.status(200).json({ ok: true, id: saved.id });
  } catch (error) {
    console.error("Website contact form failed:", error.message);
    return res.status(503).json({ error: "We could not record your request right now." });
  }
};
