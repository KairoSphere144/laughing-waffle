# KairoSphere — Agent Operating Instructions

**Audience:** OpenAI Codex and any coding agent working in this repository.  
**Project:** KairoSphere — industrial intelligence and trade operations workspace.  
**Primary market:** Suriname initially; designed to support international trade workflows over time.

Read this file before inspecting, planning, reviewing, or changing code. Treat it as the current operating brief. Re-read it at the start of each new task because the milestone section is intentionally maintained as the live hand-off.

## 1. Mission and commercial purpose

KairoSphere is being built to help identify, understand, organize, and solve operational problems experienced by real businesses and prospective clients.

The commercial cycle is:

1. **Listen:** capture a prospect's stated problem, current process, constraints, urgency, and desired outcome.
2. **Qualify:** distinguish temporary problems from recurring or long-term operational needs. Establish business value, scope, dependencies, risks, and who owns the decision.
3. **Design:** translate the problem into a practical solution with clear deliverables, acceptance criteria, and an implementation path.
4. **Deliver:** configure or build the smallest reliable solution that addresses the agreed need.
5. **Verify:** test the result with realistic data and confirm that it solves the stated problem.
6. **Maintain and improve:** record follow-up needs, recurring work, support requirements, and opportunities for longer-term service.
7. **Learn:** use outcomes and feedback to improve reusable service modules without exposing one client's confidential information to another.

The platform must support both short, fixed-scope interventions and longer-term service relationships. Do not assume every prospect wants a full website rebuild or a large software project. Prefer a small, useful, measurable first engagement where appropriate.

## 2. Service capabilities the platform should support

The operator has self-reported practical capabilities in:
- Website setup and maintenance.
- Product catalogue structuring, publishing, and data quality.
- Database and server configuration.
- Android/mobile notifications.
- Staff training and operational handover.
- Workflow automation and data notifications.
- Network and computer configuration.
- Backup and cybersecurity practices.
- Local and cloud infrastructure configuration, with specialist support where needed.

Use these as service-design inputs, not as proof of certifications or specialist credentials. Do not invent qualifications, clients, case studies, or results.

Industrial-market emphasis:
- Industrial goods, heavy equipment, parts, inventory, and trade operations.
- Product master data, catalogue quality, stock and warehouse information.
- Operational reporting, document and data workflows.
- Website and digital-channel modernization.
- Practical automation, notifications, backup, and infrastructure reliability.

## 3. Product principles

Build a dependable operational workspace, not a decorative demo.

- **Problem-first:** every feature should support a real business problem, workflow, decision, or measurable outcome.
- **Smallest useful increment:** prefer a narrow working capability over a broad unfinished subsystem.
- **Evidence-aware:** distinguish verified facts, user-entered information, estimates, sample data, and assumptions.
- **Traceable:** preserve the origin, date, owner, status, and history of important business records.
- **Secure by default:** enforce authentication, authorization, least privilege, and row-level data ownership.
- **Client confidentiality:** isolate client records and never reuse confidential data across clients.
- **Human approval:** do not send proposals, commit to prices or delivery dates, spend money, publish externally, or make irreversible changes without the operator's explicit approval.
- **No fabricated activity:** never invent outreach, client responses, payment, delivery, test results, or successful integrations.
- **Maintainable:** use clear modules, documented contracts, automated tests, and accessible UI patterns.
- **Mobile-aware:** the operator frequently works from Android. Keep essential workflows responsive and usable on narrow screens.
- **Local and cloud:** support practical local workflows and cloud-backed services without making the system dependent on unnecessary infrastructure.

## 4. Division of responsibilities

**Codex — implementation and technical verification**
- Inspect the existing repository and current milestone before coding.
- Implement backend, database, API, authentication, validation, and integration work where required.
- Inspect frontend/backend contracts and identify mismatches.
- Add or update tests, migrations, documentation, and safe configuration.
- Run relevant tests and production builds; report exact commands and outcomes.
- Review diffs for regressions, security issues, data exposure, and deployment risks.
- Report blockers and propose the smallest safe fix.

**Project architect / product lead — system structure and operating model**
- Define product architecture, user workflows, information models, dashboards, visualizations, acceptance criteria, and business priorities.
- Translate client outreach and feedback into product requirements.
- Prioritize the next milestone based on actual business value.

**Human operator / owner**
- Owns the repository, business relationships, client commitments, and final decisions.
- Reviews client-specific scope, pricing, sensitive disclosures, external communications, public deployment, and irreversible/security-sensitive changes.

Do not claim to have communicated with another agent or person unless a verifiable tool action confirms it. This file is a persistent hand-off brief; it does not itself dispatch a Codex task or send a notification.

## 5. Current technical baseline

The repository README describes an authenticated Vite + Supabase foundation with:
- Responsive operations dashboard.
- Supabase email/password authentication and session restoration.
- Authenticated opportunity CRUD.
- Shared domain validation.
- Row-level security for user-owned records.
- Node.js tests for domain logic and the Supabase adapter.
- GitHub Pages build/deployment configuration.

Respect the existing architecture. Inspect the actual source, migrations, tests, workflows, and current branch before making assumptions. Browser code may use only the Supabase publishable key; never expose a service-role key or other secret. Do not weaken RLS or database permissions to make a feature work.

Financial functionality is recordkeeping and analysis only unless a separately approved scope explicitly changes that. Do not implement payment execution, trading, custody, or money movement as an assumed feature.

## 6. Current milestone — warehouse and inventory operations foundation

**Priority:** Deliver the first genuinely useful industrial workflow: an organization can register warehouses and products, record stock receipts/issues/adjustments, and see stock-on-hand derived from an immutable movement ledger.

### Implemented in the current feature branch

- Organization and owner-membership foundation.
- Organization-scoped warehouse and product masters.
- Stock movement ledger with receipt, issue and adjustment types.
- Inventory balances derived from movements, including zero-stock combinations.
- RLS policies and explicit Data API grants.
- Responsive inventory workspace and existing commercial pipeline retained separately.
- Domain validation tests for SKU, warehouse, quantity precision, movement direction and reorder thresholds.

### Required verification before merge

1. Run `npm ci`, `npm test`, and `npm run build` in CI.
2. Apply the additive migration to the intended Supabase project only after reviewing the SQL.
3. Verify RLS and Data API grants for every new table and view.
4. Test two separate user accounts and confirm cross-organization reads/writes are denied.
5. Test opening receipt, stock issue, adjustment, zero-stock display and low-stock alerts.
6. Verify mobile layout and error/loading/empty states.
7. Review the branch diff against current `main`; do not merge or deploy without human approval.

### Next milestones

- Employee invitations and permission administration.
- Purchase requests, suppliers, purchase orders and receiving.
- Inter-warehouse transfers and barcode/QR workflows.
- Equipment register and preventive maintenance.
- Workforce tasks, operational handover and notifications.
- Finance records, reconciliations and reporting; keep accounting evidence and currencies explicit.

Do not use Jetzza International operational or personal data without the employer's explicit authorization. Employment provides first-hand process insight, not permission to access internal systems or copy records.

## 7. Engineering workflow

For every task:

1. Read this file and the README.
2. Confirm repository, branch, working tree, and latest relevant commit.
3. Inspect existing code and tests before changing anything.
4. State a short implementation plan tied to the current milestone.
5. Make focused, reviewable changes. Avoid unrelated refactors.
6. Add tests for behavior changed or introduced.
7. Run relevant tests and build; report exact results, including failures.
8. Review the final diff and identify migrations, environment variables, manual setup, and deployment implications.
9. Summarize: what changed, why, files touched, test evidence, remaining risks, and the next recommended milestone.

Database changes must include safe, reviewable migrations. Do not run destructive migrations or delete/overwrite user data. Never commit secrets or real client records. Use synthetic fixtures in tests.

Do not merge pull requests, publish/deploy publicly, change repository access/security/billing settings, force-push, delete branches, or make irreversible changes without explicit human approval.

## 8. Keeping this hand-off current

This file is the shared source of truth for the next engineering milestone.

At the end of each completed milestone:
- Update the **Current milestone** section with the new priority, concrete increments, and acceptance criteria.
- Add a dated entry to the **Milestone history** below, including commit/PR reference when available and test evidence.
- Keep the next milestone specific and limited enough to implement and verify.
- Do not mark work complete based only on code being written; require test evidence and, where applicable, an integration check.

If client outreach reveals a new requirement, record the requirement as a candidate and its source/date, but do not silently displace the current priority. The project architect / human operator sets priority.

## 9. Milestone history

- 2026-11-03 — Established this repository-level agent brief. Next engineering priority: inspect the authenticated foundation and implement the client problem-to-solution operating workflow in small, tested increments. No implementation milestone is claimed complete by this instruction-file change.
