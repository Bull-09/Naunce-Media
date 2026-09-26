# Nuance Media forms deployment

## Private pages

- `/growth-audit.html` — E-commerce Growth Audit
- `/zebra-learn-blinkit-questionnaire.html` — ZebraLearn × Blinkit discovery questionnaire
- `/nm-admin.html` — private response dashboard

All three pages include `noindex` metadata and Vercel also sends an
`X-Robots-Tag` header. The admin password supplied for this build is stored as a
one-way PBKDF2 hash, not as readable text.

## One-time Supabase setup

1. Create or open the Nuance Media Supabase project.
2. Open **SQL Editor**, paste `supabase/form_submissions.sql`, and run it.
3. In Vercel, add these Production environment variables:

   - `SUPABASE_URL` — Project Settings → API → Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → service role key

The service-role key is used only by server functions. Never put it in HTML or
in a variable beginning with `NEXT_PUBLIC_`.

## Optional questionnaire email copy

The ZebraLearn form can also email each response. Set these Vercel variables:

- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_HOST` (defaults to `smtp.hostinger.com`)
- `SMTP_PORT` (defaults to `587`)
- `ZEBRALEARN_QUESTIONNAIRE_TO` (defaults to `SMTP_USER`)

## GitHub → Vercel release flow

1. Connect this folder to a GitHub repository and push `main`.
2. In Vercel, import that repository or connect it to the existing
   `nuance-media` project.
3. Keep Framework Preset as **Other** and leave build/output commands blank.
4. Add the environment variables above and deploy.
5. Future pushes to `main` will deploy automatically.

Before sharing, submit one test response and confirm it appears at
`https://nuancemedia.agency/nm-admin.html`.
