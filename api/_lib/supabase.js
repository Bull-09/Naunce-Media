function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("storage_not_configured");
  return { base: url.replace(/\/$/, ""), key };
}

async function insertSubmission(payload) {
  const { base, key } = config();
  const response = await fetch(`${base}/rest/v1/form_submissions`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`database_write_failed:${response.status}`);
  return (await response.json())[0];
}

async function listSubmissions() {
  const { base, key } = config();
  const response = await fetch(`${base}/rest/v1/form_submissions?select=id,form_type,contact_name,contact_email,contact_phone,answers,created_at&order=created_at.desc&limit=500`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error(`database_read_failed:${response.status}`);
  return response.json();
}

module.exports = { insertSubmission, listSubmissions };
