# KairoSphere

KairoSphere is an industrial operations and trade-intelligence workspace. The initial market is Suriname; the product architecture is intended to support multiple independent businesses and their operational sites over time.

## Product direction

KairoSphere connects the operational records a business needs to manage resources reliably:

- **Warehouse and inventory:** organization workspaces, warehouses, product master data, stock receipts, issues, adjustments, balances and an auditable movement ledger.
- **Procurement and suppliers:** planned next module for purchase requests, supplier records, purchase orders and receiving.
- **Equipment and maintenance:** planned asset registers, service schedules, downtime and maintenance history.
- **Workforce and tasks:** planned roles, shift/task assignment, training and operational handovers.
- **Commercial pipeline:** current private opportunity tracking for KairoSphere's own service work.
- **Finance and reporting:** phased operational cost and revenue records, with SRD and USD kept separate and source/evidence status visible.

Financial functionality is recordkeeping and analysis only. The platform does not execute payments, custody, lending, trading or credit decisions. Any future financial-sector integration must be separately designed, legally reviewed, permissioned and auditable.

## Current implementation

- Responsive Vite application.
- Supabase email/password authentication and session restoration.
- Organization-scoped inventory data model with owner membership.
- Warehouse and product creation.
- Stock receipt, issue and adjustment entry.
- Inventory balances derived from the movement ledger rather than editable stock totals.
- Append-only stock movement permissions: authenticated users can read and insert; they cannot update or delete ledger rows through the Data API.
- Row Level Security on every new public table.
- Explicit least-privilege grants for the Supabase Data API.
- Existing private opportunity CRUD remains available as a separate commercial pipeline.
- Node.js tests for domain validation and data adapters.

## Inventory data model

The migration `supabase/migrations/20261105000100_industrial_inventory_foundation.sql` adds:

- `organizations`
- `organization_members`
- `warehouses`
- `products`
- `stock_movements`
- `inventory_balances` (security-invoker view)

Every operational record is scoped to an organization. Compound foreign keys prevent a movement from joining a product or warehouse belonging to another organization. Stock is calculated as the sum of signed movement quantities. Receipts are positive, issues are negative, and adjustments may be positive or negative.

The first release supports an organization owner workspace. Employee invitations, detailed role administration, inter-warehouse transfers, barcode scanning, purchase orders, equipment, and finance modules are later milestones—not claimed as implemented.

## Requirements and local development

- Node.js 22 recommended (Vite 8 and current Supabase JS dependencies).
- A Supabase project with the existing opportunities migration and the industrial inventory migration applied.

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using the project's API URL and publishable key.
3. Never put a Supabase service-role or secret key in browser code or a Vite environment variable.
4. Enable email/password authentication and allow the local Vite URL and the deployed site URL in Auth redirect settings.
5. Run `npm ci`, `npm test`, `npm run build`, and `npm run dev`.

The `.env.local` file is ignored by Git. The inventory migration explicitly grants the authenticated role only the required Data API privileges; it does not grant anonymous access. It also follows Supabase's current requirement to explicitly expose new public-schema tables through grants rather than assuming automatic Data API exposure.

## Deployment

The GitHub Pages workflow deploys only from `main`. It requires the repository Actions variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Feature branches are not production deployments. Review and merge are required before any production release.

Supabase CLI v3 changed hosted-command defaults: database commands target the local stack unless explicitly directed to a remote project. Do not run a hosted migration command without verifying its target and intended effect.

## Data and customer confidentiality

Use synthetic data for development and tests. Do not enter Jetzza International's stock, supplier, customer, pricing, employee or operational records unless the business has explicitly authorized that use. The user's warehouse employment is operational learning context, not permission to access or copy employer systems.

## Structure

```text
.
├── index.html
├── src/
│   ├── app.js
│   ├── domain.js
│   ├── inventory-domain.js
│   ├── inventory.js
│   ├── opportunities.js
│   ├── styles.css
│   └── supabase.js
├── supabase/migrations/
│   ├── 202611010001_create_user_owned_opportunities.sql
│   └── 20261105000100_industrial_inventory_foundation.sql
└── tests/
    ├── domain.test.js
    ├── inventory.test.js
    └── opportunities.test.js
```
