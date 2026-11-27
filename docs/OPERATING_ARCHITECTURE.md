# KairoSphere 24/7 Operating Architecture

**Status:** Architecture baseline — proposed and documented; implementation is not yet complete.  
**Repository:** `KairoSphere144/laughing-waffle`  
**Initial market:** Suriname, with international trade workflows as a later expansion.  
**Decision rule:** Reuse the existing foundation first. Add infrastructure only when a verified workload, reliability need, security boundary, or paying customer justifies it.

## 1. Purpose

KairoSphere is intended to become a dependable industrial intelligence and trade operations workspace. Its operating loop is:

1. Observe new information and business events.
2. Normalize and preserve source evidence.
3. Analyze and qualify the signal.
4. Create a proposed task or business action.
5. Execute only actions within the agent's granted permissions.
6. Request human approval for consequential actions.
7. Verify the result and preserve an audit record.
8. Feed outcomes into future decisions and reusable service modules.

"24/7" describes the target availability and event-processing model, not a claim that the current application or assistant already runs continuously. A scheduled task, a persistent worker, and a human approval are distinct execution modes and must be represented honestly.

## 2. Verified current baseline

The following was inspected on the `main` branch when this architecture was drafted:

- Frontend: Vite-based JavaScript single-page application.
- Backend/data service: Supabase JavaScript client.
- Database: PostgreSQL through Supabase; current migration defines an authenticated, user-owned `public.opportunities` table and RLS policies.
- Browser configuration: Supabase URL and publishable key; privileged service-role/secret keys must never be shipped to the browser.
- Development scripts: `npm run dev`, `npm test`, and `npm run build`.
- CI workflow: GitHub Actions runs unit tests.
- Hosting workflow: GitHub Pages builds and deploys the static frontend on pushes to `main`, requiring the documented public Supabase configuration variables.
- No persistent server-side worker, durable job queue, webhook receiver, general-purpose integration service, or operational monitoring service was found in the inspected baseline.

The repository also has open feature work, including draft PR #9 for evidence-aware opportunity intake. This architecture branch does not merge, replace, or claim completion of that work. Review its current head, findings, CI, and migration separately before integration.

## 3. Target logical architecture

```text
External sources and business events
  |-- Outlook / client enquiries
  |-- GitHub / Codex / CI events
  |-- approved market, supplier and trade sources
  |-- operator-entered warehouse and client observations
  v
Integration boundary
  |-- authenticated webhooks
  |-- scheduled source checks
  |-- API adapters with per-source rate limits
  v
Durable intake and task state (Supabase/PostgreSQL)
  |-- source records and provenance
  |-- normalized business entities
  |-- job queue, attempts, leases and outcomes
  |-- approval requests and audit events
  v
Execution workers (managed cloud runtime; add only when needed)
  |-- deterministic validation and transformations
  |-- AI-assisted extraction, classification and drafting
  |-- retryable, idempotent task handlers
  v
KairoSphere application / operator dashboard
  |-- pipeline, tasks, exceptions and evidence
  |-- review and approval controls
  |-- status, health and usage visibility
  v
Verified outputs
  |-- updated business records
  |-- prepared drafts and reports
  |-- notifications and deliverables
  |-- completion evidence and follow-up tasks
```

The diagram is a target design, not a statement that these services are already deployed.

## 4. Component responsibilities

| Component | Responsibility | Initial implementation choice |
|---|---|---|
| Web application | Human control surface, operational records, approval and reporting | Existing Vite application |
| Database | Durable business state, source provenance, task state, audit history | Existing Supabase PostgreSQL |
| Authentication and authorization | Identity, least privilege, owner/client data boundaries | Existing Supabase Auth and RLS; verify policies before expanding |
| File storage | Documents and evidence with controlled access and retention | Supabase Storage only when a concrete file workflow is implemented |
| Integration adapters | Translate external APIs/webhooks into validated internal events | Small server-side modules; no secrets in browser code |
| Scheduler | Start recurring checks and maintenance tasks | Existing scheduled automation for its current scope; later use a managed scheduler for application jobs |
| Job queue | Durable task lifecycle, retry, deduplication and failure handling | Design a database-backed queue only when worker implementation begins; evaluate Supabase Queues/pgmq and managed alternatives then |
| Worker runtime | Execute jobs independently of the user's laptop | Managed serverless/container worker when a real workload requires it |
| AI services | Structured extraction, classification, analysis and drafts | Provider-neutral adapter; model calls are optional, bounded and logged |
| Notifications | Deliver alerts for exceptions and approval requests | Existing connected channels where authorized; add push/email integration only with explicit scope |
| Observability | Job health, errors, latency, costs and auditability | Structured logs and health checks before advanced monitoring |
| Source control and CI | Versioned implementation and repeatable verification | Existing GitHub repository and Actions |

## 5. Event and job contract

Every ingested event should carry, where available:

- `event_id`: stable unique identifier for deduplication.
- `source`: connector or originating system.
- `source_record_id`: original message, issue, webhook or record identifier.
- `occurred_at` and `received_at`: source time and system receipt time.
- `event_type`: controlled event category.
- `tenant_id` / `owner_id`: authorization boundary; never inferred from untrusted payload text.
- `payload_version`: schema version.
- `evidence_uri` or a safe source reference.
- `classification`: verified, user-entered, estimated, sample, or unverified.
- `processing_status`: received, queued, processing, awaiting_approval, completed, failed, or ignored.

Every job should record its handler/version, idempotency key, attempt count, lease/heartbeat, next retry time, start/end time, result reference, error class and final status. Retry only transient failures, use bounded backoff, and route exhausted jobs to a reviewable failed state. Never silently drop an event or claim success before a result is confirmed.

Do not store full email bodies, credentials, personal information, or client documents in logs by default. Retain only the minimum content needed for the task and the approved evidence record.

## 6. Security and approval boundaries

- Browser code may contain only public configuration and publishable keys. No service-role key, AI provider secret, OAuth refresh token, or webhook signing secret belongs in the frontend or repository.
- Server-side secrets belong in the hosting provider's secret manager and must be scoped per environment.
- Validate webhook signatures where supported; reject replayed or malformed events.
- Enforce RLS on every exposed user/client data table. Authentication alone is not authorization. Client records must be isolated by an explicit tenant/ownership model before multi-client operation.
- Use least-privilege connector scopes and separate development from production credentials.
- Record who/what initiated each consequential action and its approval.
- AI output is a proposal until validated. Use structured schemas, input limits, source references and deterministic checks for important data.
- Human approval is required before spending, contracts, pricing commitments, external publication, sensitive disclosures, money movement, destructive data changes, or irreversible security/permission changes.
- Never implement financial custody, trading, or payment execution as an assumed feature.

## 7. Availability and 24/7 operating model

The target service should be event-driven where possible and scheduled where event delivery is unavailable:

- **Event-driven:** receive supported webhooks, queue work durably, acknowledge only after safe receipt, then process asynchronously.
- **Scheduled:** run bounded source checks and maintenance at documented intervals; avoid unnecessary polling.
- **Interactive:** let the operator inspect, correct, approve, reject, or defer proposed actions.
- **Recovery:** resume queued work after worker restarts, expire stale leases, retry transient failures and surface permanent failures.
- **Degraded mode:** preserve intake and task state when an external provider is unavailable; do not fabricate current data or silently mark integrations healthy.
- **Human coverage:** alert the operator only for material exceptions or approvals; do not assume a human is available around the clock.

Availability objectives, response-time targets and recovery-point objectives must be selected after observing actual workload and service-tier constraints. Do not promise 24/7 uptime until the full chain is deployed, monitored and tested.

## 8. Phased implementation plan

### Phase 0 — Foundation verification (current priority)

- Review open PRs and Codex findings; do not merge automatically.
- Reconcile the opportunity-intake work with the active milestone.
- Verify migrations, RLS, frontend persistence, mobile behavior, and CI.
- Resolve deployment configuration using public configuration only.
- Establish a clear development/staging/production environment map.
- Document backups and recovery before storing valuable client records.

**Exit gate:** application tests and production build pass; live authentication and two-user data isolation are verified; deployment behavior is understood; no unresolved critical security issue remains.

### Phase 1 — Operational data model

- Finish the client problem-to-solution workflow: opportunity, problem, proposed solution, deliverables, tasks, follow-ups, acceptance criteria and outcome evidence.
- Add provenance and status fields only where required by actual workflows.
- Define tenant/client isolation before onboarding multiple independent clients.
- Add audit events for important state changes.

**Exit gate:** a synthetic prospect can be taken from intake through scoped delivery and verified completion without manual database edits.

### Phase 2 — First integration and durable job execution

- Select one high-value integration based on a real repeated task; GitHub/CI status or a narrow Outlook intake workflow are candidates.
- Define scopes, event payload, data minimization, retention, failure behavior and approval boundaries.
- Implement one authenticated adapter and one idempotent job handler.
- Add retry, dead-letter/review state, job history and operator-visible status.
- Use a managed runtime only after its costs and deployment controls are understood.

**Exit gate:** a test event is received once logically, processed safely, survives worker restart, produces a verifiable record, and exposes failures without leaking secrets.

### Phase 3 — Commercial operations and revenue

- Connect industrial inventory, catalogue, supplier and trade workflows to qualified client needs.
- Deliver a small paid pilot with explicit scope and acceptance criteria.
- Measure time saved, errors reduced, data quality or another client-approved outcome.
- Track costs, recurring support effort and actual revenue.

**Exit gate:** at least one customer outcome is documented with permission and a repeatable delivery method exists. Do not fabricate a case study.

### Phase 4 — Digital Explorer infrastructure

- Build an equipment register with capability, price quotes, compatibility, warranty, import/shipping costs, power requirements and expected productive use.
- Prioritize workstation, backup/storage, reliable network and power protection according to actual bottlenecks.
- Add local inference, secondary compute, robotics/electronics equipment only when a workload and return case justify them.
- Fund purchases from approved resources without compromising essential living costs or operating reserves.

**Exit gate:** equipment has a documented business/research purpose, verified supply path, full landed cost and acceptance test.

## 9. Infrastructure purchasing policy

Start with existing GitHub, Supabase and approved connected services. Do not add a paid queue, always-on VM, NAS, GPU, or AI subscription simply to make the architecture look complete.

For every proposed paid service or device, record:

1. Workload it solves and why current tools cannot handle it.
2. Free/low-cost alternatives and migration path.
3. Monthly and usage-based cost, including currency conversion and taxes where relevant.
4. Data location, security model, backup/export path and vendor lock-in.
5. Suriname availability, payment route, connectivity and support feasibility.
6. Measurable productivity or revenue benefit.
7. Shutdown/rollback procedure.

## 10. Immediate engineering sequence

1. Reconcile and review draft PR #9 and its unresolved Codex findings before building on its data model.
2. Inspect current main-branch CI and Pages workflow behavior; PR #8 proposes deleting the existing Pages workflow, so preserve production deployment until an alternative is verified.
3. Complete the opportunity-to-delivery workflow and verify the live Supabase boundary.
4. Define one narrow integration based on a repeated operational need.
5. Only then implement a small worker and durable job lifecycle.

## 11. What this document does not claim

This document does not claim that a cloud worker, queue, webhook receiver, AI API, storage backup policy, monitoring service, 24/7 uptime, paid customer, applied migration, or live integration exists. Those are explicit implementation milestones requiring evidence.

**Architecture principle:** Build a small reliable operating system that compounds verified business value. Add autonomy only where permissions, data quality, observability and recovery are strong enough to support it.


## 12. Participant and workforce capacity

KairoSphere must support controlled capacity expansion through paid participants where approved work and funding justify it. The dedicated operating specification is [docs/PARTICIPANT_WORKFORCE_MANAGEMENT.md](PARTICIPANT_WORKFORCE_MANAGEMENT.md).

The workforce domain connects approved opportunities and delivery plans to work packages, candidate assessment, engagements, assignments, milestones, compensation obligations, payment evidence and access lifecycle. It is a separate access-controlled domain; participant and compensation data must not be exposed through ordinary opportunity permissions.

Implementation order:
1. Finish and verify the existing opportunity-to-delivery workflow and tenant/ownership model.
2. Define the legal engagement and jurisdiction review checklist.
3. Implement work packages, participant records, engagement approvals and assignments using synthetic test data.
4. Add milestone/time evidence and independent acceptance.
5. Add compensation obligations and payment tracking, keeping currencies separate.
6. Evaluate a payout provider only after jurisdiction eligibility, fees, KYC, security and user approval are established.

Recruitment must not begin without an approved work package and budget. No work commitment may exceed its authorized cap. A deliverable submitter cannot be the sole approver of their own payment. Payment obligation, payment instruction and confirmed settlement are distinct states. Actual money movement remains outside this initial scope and requires separate authorization.

This workforce capability is a planned expansion, not a claim that recruitment, payroll, contractor onboarding, or payouts are already implemented.
