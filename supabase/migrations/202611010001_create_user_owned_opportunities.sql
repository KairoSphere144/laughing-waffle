-- KairoSphere: user-owned commercial opportunities.
-- All authenticated access is constrained by row-level security.

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name varchar(80) not null check (char_length(btrim(name)) between 1 and 80),
  stage text not null default 'lead'
    check (stage in ('lead', 'qualified', 'proposal', 'negotiation')),
  amount numeric(14,2) not null check (amount > 0),
  currency text not null check (currency in ('USD', 'SRD')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunities_user_created_idx
  on public.opportunities (user_id, created_at desc);

alter table public.opportunities enable row level security;

revoke all on table public.opportunities from anon;
grant select, insert, update, delete on table public.opportunities to authenticated;

drop policy if exists "Users can view their own opportunities" on public.opportunities;
create policy "Users can view their own opportunities"
  on public.opportunities for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own opportunities" on public.opportunities;
create policy "Users can create their own opportunities"
  on public.opportunities for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own opportunities" on public.opportunities;
create policy "Users can update their own opportunities"
  on public.opportunities for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own opportunities" on public.opportunities;
create policy "Users can delete their own opportunities"
  on public.opportunities for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_opportunities_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_opportunities_updated_at on public.opportunities;
create trigger set_opportunities_updated_at
  before update on public.opportunities
  for each row execute function public.set_opportunities_updated_at();
