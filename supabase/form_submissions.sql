create extension if not exists pgcrypto;

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists form_submissions_type_created_idx
  on public.form_submissions (form_type, created_at desc);

alter table public.form_submissions enable row level security;

-- No public policies are intentionally created. The Vercel API uses the
-- server-only service-role key; browsers cannot read or write this table.
