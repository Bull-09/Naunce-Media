-- Run this once in the Supabase SQL Editor for the ZebraLearn questionnaire.
create table if not exists public.zebralearn_blinkit_questionnaires (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  contact_email text not null,
  answers jsonb not null,
  submitted_at timestamptz not null default now()
);

alter table public.zebralearn_blinkit_questionnaires enable row level security;

-- The browser has no direct table access. The Vercel API writes with the service-role key.
