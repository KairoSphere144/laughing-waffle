# Supplier-to-Procurement Workflow

**Status:** workflow contract / implementation hand-off. This document does not claim that supplier or procurement functionality is implemented.

**Integration base:** `feature/warehouse-operations-foundation`  
**Target branch:** `integration/supplier-procurement-workflow`

## Purpose

Define one traceable supplier-to-procurement lifecycle that reuses KairoSphere's existing organization, product, warehouse, and stock-movement foundations. Do not create a parallel inventory ledger or treat a document specification as proof of working functionality.

## Existing repository foundation (verified on the integration base)

| Capability | Existing implementation | Status |
|---|---|---|
| Organization ownership | `organizations`, `organization_members` in `supabase/migrations/20261105000100_industrial_inventory_foundation.sql` | Implemented on base branch |
| Product master | `products`, `src/inventory-domain.js`, `src/inventory.js` | Implemented on base branch |
| Warehouse master | `warehouses`, `src/inventory.js` | Implemented on base branch |
| Stock ledger | `stock_movements`, `recordStockMovement()` | Implemented on base branch |
| Derived stock balances | `inventory_balances` security-invoker view | Implemented on base branch |
| Inventory UI | `index.html`, `src/app.js` inventory view | Implemented on base branch |
| Supplier master / qualification | No supplier table or adapter found in this branch tree | NOT IMPLEMENTED |
| RFQ / quotation / award | No corresponding schema or module found | NOT IMPLEMENTED |
| Purchase requisition / order | No corresponding schema or module found | NOT IMPLEMENTED |
| Approval workflow | No procurement approval model found | NOT IMPLEMENTED |
| Goods receipt / inspection | No procurement receiving model found; generic stock receipt exists | NOT IMPLEMENTED |
| Invoice matching / payment status | No corresponding schema or module found | NOT IMPLEMENTED |

The README on the base branch explicitly lists procurement and suppliers as a planned next module and explicitly says purchase orders are a later milestone. The current inventory receipt form is a generic stock movement, not a purchase-order receipt.

## Lifecycle contract

Every record must be organization-scoped, linked to its source record, and auditable. Keep currencies explicit (USD and SRD must never be silently combined). Preserve evidence and distinguish verified, user-entered, inferred, estimated, and missing values.

| Stage | Required record / transition | Link to existing foundation | Permission / gate | Status |
|---|---|---|---|---|
| 1. Supplier discovery | Candidate supplier, source, contact channel, evidence, discovery date | Organization; product/category references where known | Authorized operator creates; unverified source remains candidate | NOT IMPLEMENTED |
| 2. Supplier onboarding and qualification | Supplier profile, legal/contact details, capability, territory, terms, documents, risk checks, reviewer, review outcome and expiry | Organization membership and audit conventions | Reviewer approval before supplier becomes qualified/active | NOT IMPLEMENTED |
| 3. Sourcing / RFQ | Sourcing request, requested items/specifications, quantities, delivery location/date, invited suppliers, RFQ issue/response timestamps | Product master and warehouse destination | Buyer creates; issue/send is an external commitment and requires human approval | NOT IMPLEMENTED |
| 4. Quotation capture and comparison | Supplier quote, line-level prices, currency, taxes/fees, lead time, validity, freight, warranty, evidence/source document, exceptions | Product IDs; supplier IDs; explicit currency fields | Comparison must expose missing/estimated values; award requires authorized approval | NOT IMPLEMENTED |
| 5. Award and purchase requisition | Approved supplier selection, business justification, budget/cost centre if configured, requisition lines and status | Organization, products, warehouse | Requisition submit/approve/reject separated by permission; no self-approval unless explicitly configured | NOT IMPLEMENTED |
| 6. Purchase order | Immutable PO number, supplier, selected quote, line snapshots, quantities, unit price/currency, terms, ship-to warehouse, expected dates, revision/cancellation history | Supplier, product, warehouse; retain quote/requisition references | PO issue, revision, cancellation require explicit approval and audit event | NOT IMPLEMENTED |
| 7. Delivery, goods receipt and inspection | Receipt against PO lines; accepted, rejected, damaged, short/over quantities; delivery note; inspection evidence; discrepancy case | On acceptance, create linked positive `stock_movements` receipt rows; rejected/quarantined quantities must not increase available stock | Receiving role records; inspection/exception approval before accepted stock posts | NOT IMPLEMENTED |
| 8. Invoice matching | Supplier invoice header/lines matched against PO and accepted receipt quantities (three-way match); variance reason and dispute status | PO and receipt IDs; product and currency snapshots | Match tolerances are explicit and configured; exceptions require approval | NOT IMPLEMENTED |
| 9. Payment status and supplier performance | Invoice payable status, due date, payment reference/evidence, amount/currency; supplier on-time, quality, price and discrepancy history | Supplier, PO, receipt, invoice, audit history | Recordkeeping only; no money movement. Payment confirmation requires evidence and authorized user | NOT IMPLEMENTED |

## Required data relationships

- All supplier, sourcing, requisition, PO, receipt, invoice, and approval records carry `organization_id`.
- Use composite organization-scoped foreign keys for relationships, following the existing inventory migration pattern.
- Purchase-order lines preserve a snapshot of description, SKU, unit, quantity, unit price, currency, and agreed terms. Later product-master edits must not rewrite historical orders.
- A receipt line references its PO line and warehouse. Accepted quantity posts to the existing append-only `stock_movements` ledger with the PO/receipt reference. Never write inventory balances directly.
- Rejected, damaged, quarantined, or disputed quantities remain separately visible and are not counted as available stock until a separately approved release/adjustment.
- Invoice matching compares invoiced quantities and prices to PO quantities/prices and accepted receipt quantities. Partial deliveries and partial invoices must be supported.
- Use explicit state transitions with actor, timestamp, reason, and source evidence. Do not allow arbitrary status edits to bypass approvals.
- Maintain SRD and USD as separate totals. Do not invent FX rates or combine currencies.
- No payment API, custody, bank transfer, or money movement is in scope; payment status is evidence-backed recordkeeping only.

## Integration rules

1. Reuse `organizations`, `organization_members`, `products`, `warehouses`, `stock_movements`, and `inventory_balances`. Do not create a second product, warehouse, or stock-balance system.
2. Add procurement adapters as separate modules; do not overload `src/inventory.js` with supplier/procurement business logic.
3. Keep the existing Vite + vanilla JavaScript + Supabase architecture unless a measured requirement justifies change.
4. Add navigation only for modules that have real page modules, data adapters, RLS, and tests. Until then, mark them planned/disabled rather than functional.
5. Apply RLS to every new table and grant only required Data API privileges. Membership and role checks must be enforced server-side by RLS, not only by hidden UI controls.
6. Preserve an append-only audit trail for approvals, awards, PO issue/revision/cancellation, receiving discrepancies, invoice match decisions, and payment evidence.
7. Use synthetic fixtures only. Do not import employer or client supplier, pricing, stock, or contact records without explicit authorization.
8. Do not apply migrations to a live Supabase project, merge, deploy, send RFQs/POs, or initiate payments as part of implementation.

## Acceptance criteria for implementation

- Supplier CRUD, qualification status, evidence references, and review history are organization-isolated.
- RFQs can be drafted, reviewed, issued only after approval, and linked to invited suppliers and responses.
- Quote comparison is line-level, currency-safe, and shows unknown or estimated values without silently ranking them as facts.
- Requisition approval and supplier award are auditable and permission-checked.
- PO lines preserve historical snapshots and support partial fulfillment, revision, and cancellation rules.
- Goods receipt and inspection are linked to PO lines; accepted stock posts exactly once to `stock_movements`; retries are idempotent; rejected/damaged goods do not inflate available stock.
- Invoice matching supports partial delivery/invoice and explicit variance exceptions.
- Payment status is evidence-backed recordkeeping only.
- RLS tests demonstrate cross-organization reads and writes are denied.
- Unit tests cover state transitions, quantity limits, duplicate receipt prevention, three-way matching, currencies, and approval gates.
- CI runs `npm ci`, `npm test`, and `npm run build`; local browser and live Supabase checks are separately reported as VERIFIED / FAILED / NOT VERIFIED.

## Companion working materials located outside this repository

The Library contains `Physical_to_Digital_Inventory_System.xlsx` (a physical-to-digital inventory intake and QA workbook), `StockFlow_Concept_Brief.pdf` (warehouse picking / stock traceability concept), and `StockFlow_Lead_Tracker.xlsx` (supplier-quote and equipment-sourcing follow-up actions). These are useful supporting materials, but none is a complete end-to-end supplier-to-procurement specification. They must not be represented as implemented software or imported as live business data.

## Implementation sequence

1. Supplier master, qualification, evidence, and RLS.
2. RFQ and quotation capture/comparison.
3. Requisition approval and supplier award.
4. PO lifecycle and immutable line snapshots.
5. Goods receipt/inspection connected to the existing stock ledger.
6. Three-way invoice matching and payment-status evidence.
7. Supplier performance reporting, navigation, and end-to-end tests.

Implement each increment on this branch with migrations, adapters, UI, tests, and a reviewable PR. Do not claim the entire workflow complete until all acceptance criteria and required integration checks pass.
