# ZebraLearn × Blinkit questionnaire — launch setup

The client page is `zebra-learn-blinkit-questionnaire.html`. It is private by default: it has no-index meta tags and Vercel sends an `X-Robots-Tag` no-index header.

## Recommended response storage: Supabase

Supabase is the right fit here. It gives Nuance Media a secure, searchable response table with almost no operational overhead, while the form remains a fast static page. Responses are only written by the serverless API; the browser never receives a database key.

1. Create a Supabase project.
2. In its SQL Editor, run `supabase/zebralearn_questionnaires.sql`.
3. In Vercel → Project → Settings → Environment Variables, add:

   - `SUPABASE_URL` — the project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — the service-role key (server-only; never expose it in the page)
   - `SMTP_USER` — the sending mailbox
   - `SMTP_PASSWORD` — that mailbox’s SMTP password
   - `ZEBRALEARN_QUESTIONNAIRE_TO` — the Nuance inbox to receive instant submission emails

   Optional SMTP variables: `SMTP_HOST` (defaults to `smtp.hostinger.com`) and `SMTP_PORT` (defaults to `587`).

4. Deploy and submit one test response. Confirm it appears in Supabase and the notification email arrives.

The direct client URL will be `/zebra-learn-blinkit-questionnaire.html` (or the extensionless route where supported by the host).
