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

## 5. Current technical baseline and branch scope

The **intended production baseline on `main`** is the authenticated Vite + Supabase foundation described in the root README:
- Responsive operations dashboard.
- Supabase email/password authentication and session restoration.
- Authenticated opportunity CRUD.
- Shared domain validation.
- Row-level security for user-owned records.
- Node.js tests for domain logic and the Supabase adapter.
- GitHub Pages build/deployment configuration.

This describes the `main` baseline; it does not guarantee that every branch contains those features. At the start of each task, inspect the checked-out branch, README, package scripts, source, workflows, tests, migrations, and current commit. Treat the actual checkout as the implementation baseline. If it is a static preview or otherwise differs from `main`, record the differences and follow the explicitly selected milestone; do not assume the branches are already integrated or silently import the other branch's architecture.

Respect the architecture that is actually present on the selected branch. Browser code may use only the Supabase publishable key; never expose a service-role key or other secret. Do not weaken RLS or database permissions to make a feature work.

Financial functionality is recordkeeping and analysis only unless a separately approved scope explicitly changes that. Do not implement payment execution, trading, custody, or money movement as an assumed feature.

## 6. Current milestone — client problem-to-solution operating foundation

**Priority:** Build a reliable workflow that turns a real prospect conversation into a qualified opportunity, a scoped solution, a delivery plan, and a verifiable outcome.

### Required next increments

1. **Inspect current implementation**
   - Map the current dashboard, opportunity data model, Supabase schema/RLS, validation, tests, and navigation.
   - Identify what already exists; do not duplicate functioning features.
   - Report gaps before proposing broad refactors.

2. **Opportunity intake**
   - Capture organization/contact reference, source of lead, date received, problem statement, current process, impact, urgency, desired outcome, and next follow-up.
   - Record only information actually supplied; unknown values remain unknown.
   - Support a clear status lifecycle such as: New → Contacted → Qualified → Proposed → Accepted / Declined → In Delivery → Completed → Follow-up.
   - Allow a prospect to have multiple distinct problems/opportunities without conflating them.

3. **Problem and solution definition**
   - For each opportunity, record temporary vs recurring/long-term need, root problem, proposed intervention, expected deliverables, exclusions, dependencies, risks, estimated effort, acceptance criteria, and evidence required to verify completion.
   - Separate client-stated facts from internal analysis and proposed assumptions.

4. **Milestone and task tracking**
   - Link tasks and milestones to an opportunity.
   - Track owner, status, due date, dependencies, and completion evidence.
   - Make the next action obvious; avoid dashboards that show activity without a clear action.

5. **Client follow-up and delivery record**
   - Track last contact, next follow-up date, communication summary, decisions, and open questions.
   - Do not automatically send external messages. Prepare drafts or reminders only unless the operator explicitly authorizes sending.
   - Preserve a delivery and handover record for completed work.

6. **Operational dashboard**
   - Show actionable pipeline stages, overdue follow-ups, upcoming tasks, active delivery, and completed outcomes.
   - Keep SRD and USD amounts separate. Never silently combine currencies.
   - Clearly label estimates, confirmed values, and missing information.
   - Optimize the main workflows for mobile.

### Staged acceptance criteria

Complete one stage at a time. Keep each implementation change reviewable, attach its evidence, and do not begin a later stage while the current stage has an unresolved acceptance failure.

**Stage 0 — implementation readiness**
- Record the exact branch and commit, current app architecture, opportunity data model, persistence/authentication, RLS, tests, and deployment workflow.
- Identify existing work and PRs that affect the next stage; verify current CI/build evidence for the exact commit.
- State the single smallest unblocked implementation stage and any required configuration or migration review.
- Do not claim readiness if the branch or target environment is unknown.

**Stage 1 — opportunity intake**
- A user can create and update an opportunity with validated intake fields.
- Client-stated facts, internal analysis, estimates, and unknown information remain distinguishable; do not fabricate missing values.
- A prospect can have multiple distinct opportunities.
- Validation, lifecycle, and persistence behavior have tests. Authenticated branches also verify owner isolation under RLS.
- The UI provides loading, empty, success, and error states.

**Stage 2 — problem and solution scope**
- An opportunity can record temporary or recurring need, proposed intervention, deliverables, exclusions, dependencies, risks, effort estimate, acceptance criteria, and verification evidence.
- Client-stated facts remain distinct from internal analysis and assumptions.
- Tests cover validation and persistence of the scope fields.

**Stage 3 — tasks and milestones**
- Tasks and milestones link to an opportunity and record owner, status, due date, dependencies, and completion evidence.
- The interface makes the next action and overdue work clear.
- Tests cover linking, status changes, due-date behavior, and authorization where applicable.

**Stage 4 — follow-up and delivery record**
- Contact history, next follow-up, decisions, open questions, and delivery/handover evidence can be recorded.
- External communications remain drafts unless separately authorized.
- Tests cover persistence and access controls.

**Stage 5 — operational dashboard**
- The dashboard surfaces actionable pipeline stages, overdue follow-ups, upcoming tasks, active delivery, and verified outcomes.
- USD and SRD remain separate; estimates, confirmed values, and missing data are clearly identified.
- Core workflows remain usable on mobile and have relevant UI and data tests.

For every code stage, run `npm test` and `npm run build` against the exact reviewed commit, or report reproducible failures. Never introduce secrets, real client data, or unapproved external commitments.

## 6A. Extended product build route — operational core to industrial platform

This roadmap extends the current problem-to-solution milestone. It does not authorize skipping the current acceptance criteria or building every subsystem at once. Work in the sequence below, using the smallest independently testable increment.

### Gate 0 — reconcile existing pull requests and deployment foundation

Before adding new schema or features:
- Inspect the exact current heads, base commits, complete diffs, review comments, and CI results for PR #9 (opportunity intake), PR #10 (continuous operating architecture), and PR #11 (participant/workforce foundation).
- Reconcile overlapping architecture documents between PR #10 and PR #11. Keep one canonical operating architecture and link to it; do not maintain competing copies.
- PR #9's intake migration must be reviewed against the live schema and RLS before it is applied. Verify the exact current PR head with `npm ci`, `npm test`, and `npm run build`; do not rely on an earlier commit's green check.
- Preserve the existing GitHub Pages deployment workflow. Inspect PR #7/#8 or any workflow replacement for its actual effect before accepting changes; never remove the only working production deployment path without a verified replacement.
- Confirm the target Supabase project/environment before any migration. Browser code may contain only the publishable key; never request, expose, or commit service-role secrets.
- Report a concise readiness matrix and identify the single smallest unblocked task before proceeding.

### Gate 1 — complete the opportunity-to-delivery operating core

After the opportunity-intake foundation is safely integrated:
1. Define solution scope linked to an opportunity: client-stated facts, internal analysis, proposed intervention, deliverables, exclusions, dependencies, risks, estimated effort, acceptance criteria, and verification evidence.
2. Add opportunity-linked tasks and milestones with owner, status, due date, dependencies, and completion evidence.
3. Add contact/follow-up history and delivery/handover records. External messages remain drafts unless explicitly approved.
4. Surface overdue follow-ups, upcoming work, active delivery, and verified outcomes in the dashboard.
5. Keep estimated and confirmed values distinct; keep SRD and USD separate.
6. Add lifecycle, validation, persistence, and authorization tests. Keep the UI responsive and avoid unrelated rewrites.

### Gate 2 — settle ownership and authorization before workforce schema

Do not create workforce tables until the product explicitly chooses whether the MVP is single-operator-owned or supports organizations/tenants and membership. A row's `user_id` is not, by itself, a tenant model.

Design and document:
- Organization/tenant membership and role assignment, if multi-tenant operation is required.
- Separate access for operator/recruiter, participant, work-package budget approver, deliverable reviewer, compensation reviewer, and payment approver.
- Participant self-access to only their permitted profile, engagement, assignment, and deliverable information.
- Separation of duties: participants must not approve their own deliverables or compensation/payment records.
- More restrictive authorization for personal, compensation, and payment data than ordinary opportunity records.
- Minimal personal-data collection, retention, audit history, and client/tenant isolation.

Design migrations and RLS policies together. Add positive and negative tests for cross-user, cross-tenant, participant self-access, role boundaries, and compensation/payment visibility. Do not treat a clean security-advisor report as a substitute for these tests.

### Gate 3 — implement workforce MVP in controlled increments

Only after Gates 0–2 pass, implement in this order:
1. Approved work packages with scope, required skills, dates, and explicit budget ceilings.
2. Minimal candidate/participant records and controlled participant access.
3. Engagement terms and agreement status, with no unsupported employment/contractor classification.
4. Assignments, milestones, attendance or work evidence only where required, and deliverable acceptance.
5. Compensation obligations, kept separate from actual payment/settlement records.
6. Manual settlement evidence and reconciliation; never mark an obligation paid without independent bank/provider evidence.
7. Management views and audit history with least-privilege access.

No recruitment or engagement should proceed without an approved work package and budget. Scope or budget changes require an explicit amendment. Do not implement payout APIs, custody, payment execution, or money movement as an assumed feature. Obtain qualified Suriname jurisdiction/classification review before activating paid engagements.

### Gate 4 — industrial resource and trade operations

After the operational and workforce foundations are proven, extend the shared model incrementally:
- Product and parts master data, catalogue quality, supplier references, and purchasing records.
- Inventory locations, stock movements, reservations, adjustments, and traceable counts.
- Equipment/assets, maintenance schedules, service history, and availability.
- Warehouse workflows connecting receiving, put-away, picking, dispatch, and delivery evidence.
- Operational reporting that distinguishes planned, recorded, verified, and reconciled quantities/values.

Do not introduce stock valuation, accounting, or financial claims without explicit data definitions, currency handling, reconciliation rules, and auditability. Avoid duplicating a dedicated ERP/accounting system where an integration is safer.

### Gate 5 — automation and integration infrastructure

Only when the underlying workflows and authorization are stable:
- Add event-driven integrations and durable background processing where real workflows require them.
- Use idempotency, retries, dead-letter/error visibility, audit logs, and human approval for consequential actions.
- Add scheduled jobs, notifications, and external adapters as independently testable modules.
- Monitor failures and integration health; do not claim an action completed until the external system confirms it.

Do not add always-on infrastructure, paid services, or unnecessary orchestration merely to create the appearance of autonomy. Prefer the smallest reliable architecture compatible with the workload and budget.

### Codex implementation contract for this roadmap

For every increment: inspect current code and data contracts first; state the narrow plan; use a dedicated branch and reviewable PR; include safe migrations and RLS tests when schema changes; run and report exact test/build commands against the exact head; review the final diff; document environment setup and manual integration steps; and state remaining risks. Do not fabricate passing tests or live integration evidence.

This roadmap does not authorize merging, public deployment, production migration application, permission/security/billing changes, destructive operations, external commitments, or handling secrets. Those remain approval-gated.

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
- 2026-11-05 — Clarified that the Vite + Supabase description is the intended `main` baseline and that agents must inspect the checked-out branch before implementation. Split the problem-to-solution milestone into readiness, intake, solution scope, tasks/milestones, follow-up/delivery, and dashboard stages with separate acceptance criteria. No application feature or deployment is claimed complete by this instruction update.
