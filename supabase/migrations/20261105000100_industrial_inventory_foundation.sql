-- KairoSphere industrial inventory foundation
-- Additive migration: preserves the existing opportunities table and records.
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','manager','operator','viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (id, organization_id)
);

create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null check (char_length(btrim(code)) between 1 and 24),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  location text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code),
  unique (id, organization_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sku text not null check (char_length(btrim(sku)) between 1 and 64),
  name text not null check (char_length(btrim(name)) between 2 and 160),
  description text,
  unit text not null default 'each' check (char_length(btrim(unit)) between 1 and 24),
  reorder_point numeric(14,3) not null default 0 check (reorder_point >= 0),
  unit_cost numeric(14,2) not null default 0 check (unit_cost >= 0),
  cost_currency text not null default 'SRD' check (cost_currency in ('SRD','USD')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, sku),
  unique (id, organization_id)
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  warehouse_id uuid not null,
  product_id uuid not null,
  movement_type text not null check (movement_type in ('receipt','issue','adjustment')),
  quantity_delta numeric(14,3) not null check (quantity_delta <> 0),
  reference text,
  notes text,
  recorded_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint stock_movements_quantity_direction check (
    (movement_type = 'receipt' and quantity_delta > 0)
    or (movement_type = 'issue' and quantity_delta < 0)
    or movement_type = 'adjustment'
  ),
  constraint stock_movements_warehouse_org_fk
    foreign key (warehouse_id, organization_id)
    references public.warehouses(id, organization_id) on delete restrict,
  constraint stock_movements_product_org_fk
    foreign key (product_id, organization_id)
    references public.products(id, organization_id) on delete restrict
);

create index if not exists organization_members_user_org_idx
  on public.organization_members(user_id, organization_id);
create index if not exists warehouses_org_active_idx
  on public.warehouses(organization_id, is_active);
create index if not exists products_org_active_name_idx
  on public.products(organization_id, is_active, name);
create index if not exists stock_movements_org_created_idx
  on public.stock_movements(organization_id, created_at desc);
create index if not exists stock_movements_warehouse_product_idx
  on public.stock_movements(warehouse_id, product_id, created_at desc);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.warehouses enable row level security;
alter table public.products enable row level security;
alter table public.stock_movements enable row level security;

create policy "Organization owners and members can view organizations"
  on public.organizations for select to authenticated
  using (
    created_by = (select auth.uid())
    or exists (
      select 1 from public.organization_members m
      where m.organization_id = organizations.id and m.user_id = (select auth.uid())
    )
  );

create policy "Authenticated users can create their own organizations"
  on public.organizations for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy "Organization owners can update organizations"
  on public.organizations for update to authenticated
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = organizations.id
        and m.user_id = (select auth.uid()) and m.role = 'owner'
    )
  )
  with check (created_by = (select auth.uid()));

create policy "Members can view their own membership"
  on public.organization_members for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Organization creator can establish owner membership"
  on public.organization_members for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (
      select 1 from public.organizations o
      where o.id = organization_members.organization_id
        and o.created_by = (select auth.uid())
    )
  );

create policy "Members can view organization warehouses"
  on public.warehouses for select to authenticated
  using (exists (
    select 1 from public.organization_members m
    where m.organization_id = warehouses.organization_id
      and m.user_id = (select auth.uid())
  ));

create policy "Managers can create warehouses"
  on public.warehouses for insert to authenticated
  with check (exists (
    select 1 from public.organization_members m
    where m.organization_id = warehouses.organization_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner','admin','manager')
  ));

create policy "Managers can update warehouses"
  on public.warehouses for update to authenticated
  using (exists (
    select 1 from public.organization_members m
    where m.organization_id = warehouses.organization_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner','admin','manager')
  ))
  with check (exists (
    select 1 from public.organization_members m
    where m.organization_id = warehouses.organization_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner','admin','manager')
  ));

create policy "Members can view organization products"
  on public.products for select to authenticated
  using (exists (
    select 1 from public.organization_members m
    where m.organization_id = products.organization_id
      and m.user_id = (select auth.uid())
  ));

create policy "Managers can create products"
  on public.products for insert to authenticated
  with check (exists (
    select 1 from public.organization_members m
    where m.organization_id = products.organization_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner','admin','manager')
  ));

create policy "Managers can update products"
  on public.products for update to authenticated
  using (exists (
    select 1 from public.organization_members m
    where m.organization_id = products.organization_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner','admin','manager')
  ))
  with check (exists (
    select 1 from public.organization_members m
    where m.organization_id = products.organization_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner','admin','manager')
  ));

create policy "Members can view stock movement ledger"
  on public.stock_movements for select to authenticated
  using (exists (
    select 1 from public.organization_members m
    where m.organization_id = stock_movements.organization_id
      and m.user_id = (select auth.uid())
  ));

create policy "Operators can record stock movements"
  on public.stock_movements for insert to authenticated
  with check (
    recorded_by = (select auth.uid())
    and exists (
      select 1 from public.organization_members m
      where m.organization_id = stock_movements.organization_id
        and m.user_id = (select auth.uid())
        and m.role in ('owner','admin','manager','operator')
    )
  );

-- A ledger-derived balance prevents clients from directly editing stock totals.
create or replace view public.inventory_balances
with (security_invoker = true)
as
select
  p.organization_id,
  w.id as warehouse_id,
  w.code as warehouse_code,
  w.name as warehouse_name,
  p.id as product_id,
  p.sku,
  p.name as product_name,
  p.unit,
  p.reorder_point,
  p.unit_cost,
  p.cost_currency,
  coalesce(sum(sm.quantity_delta), 0)::numeric(14,3) as quantity_on_hand
from public.products p
cross join public.warehouses w
left join public.stock_movements sm
  on sm.product_id = p.id
  and sm.warehouse_id = w.id
  and sm.organization_id = p.organization_id
where p.organization_id = w.organization_id
  and p.is_active
  and w.is_active
group by
  p.organization_id, w.id, w.code, w.name,
  p.id, p.sku, p.name, p.unit, p.reorder_point,
  p.unit_cost, p.cost_currency;

-- Explicit least-privilege grants: public-schema tables are not automatically exposed
-- to the Data API on new projects. No anonymous access and no ledger mutation/deletion.
revoke all on public.organizations, public.organization_members, public.warehouses,
  public.products, public.stock_movements from anon, authenticated;
revoke all on public.inventory_balances from anon, authenticated;
grant select, insert, update on public.organizations to authenticated;
grant select, insert on public.organization_members to authenticated;
grant select, insert, update on public.warehouses to authenticated;
grant select, insert, update on public.products to authenticated;
grant select, insert on public.stock_movements to authenticated;
grant select on public.inventory_balances to authenticated;
