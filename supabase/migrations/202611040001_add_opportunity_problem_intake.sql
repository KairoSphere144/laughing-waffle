-- KairoSphere: add evidence-aware client problem intake to existing opportunities.
-- Existing RLS policies continue to protect every row by user_id.
alter table public.opportunities
  alter column amount drop not null;

alter table public.opportunities
  add column if not exists organization text,
  add column if not exists contact_name text,
  add column if not exists lead_source text,
  add column if not exists problem_statement text,
  add column if not exists current_process text,
  add column if not exists business_impact text,
  add column if not exists urgency text not null default 'unknown'
    check (urgency in ('unknown', 'low', 'normal', 'high', 'critical')),
  add column if not exists problem_duration text not null default 'unknown'
    check (problem_duration in ('unknown', 'one_off', 'recurring')),
  add column if not exists desired_outcome text,
  add column if not exists next_follow_up date;

create index if not exists opportunities_user_follow_up_idx
  on public.opportunities (user_id, next_follow_up)
  where next_follow_up is not null;
