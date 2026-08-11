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

-- Use this view in the Supabase Table Editor to see every questionnaire answer
-- as a separate, readable column instead of one JSON cell.
create or replace view public.zebralearn_blinkit_questionnaire_responses as
select
  id,
  submitted_at,
  contact_name,
  contact_email,
  answers ->> 'blinkitRole' as blinkit_role,
  answers ->> 'businessPriority' as business_priority,
  answers ->> 'businessPriorityOther' as business_priority_other,
  answers ->> 'rankRevenue' as rank_revenue,
  answers ->> 'rankDiscovery' as rank_new_customer_discovery,
  answers ->> 'rankLaunches' as rank_new_title_launches,
  answers ->> 'rankCompetition' as rank_competing_publishers,
  answers ->> 'rankStock' as rank_slow_moving_stock,
  answers ->> 'rankVisibility' as rank_brand_visibility,
  answers ->> 'primaryKpi' as primary_kpi,
  answers ->> 'launchDetails' as blinkit_launch_and_coverage,
  answers ->> 'currentRevenue' as current_blinkit_numbers,
  answers ->> 'heroTitles' as hero_titles,
  answers ->> 'performanceLearning' as past_performance_learnings,
  answers ->> 'purchaseMode' as purchase_mode,
  answers -> 'readerGoals' as reader_goals,
  answers ->> 'readerAge' as reader_age_range,
  answers ->> 'careerStage' as reader_career_stage,
  answers ->> 'priorityCities' as priority_cities,
  answers ->> 'historicalData' as historical_ads_data,
  answers ->> 'sellerHubAccess' as seller_hub_access
from public.zebralearn_blinkit_questionnaires;
