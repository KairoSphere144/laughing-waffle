# Participant & Workforce Management

**Status:** Product and control foundation proposed; implementation is not yet live.  
**Repository:** `KairoSphere144/laughing-waffle`  
**Initial operating context:** Suriname; international participation may follow after jurisdiction and payout checks.

## 1. Purpose

KairoSphere must be able to bring additional people into approved work so that delivery capacity can grow without losing accountability, quality, financial control, or client confidentiality.

The module manages the complete work relationship:

1. Identify a capacity gap and define the work.
2. Create a role or work package with scope, skills, time expectation, budget and acceptance criteria.
3. Source and assess potential participants fairly.
4. Verify identity and relevant capability proportionately before access or engagement.
5. Agree the engagement type, scope, compensation, currency, schedule, deliverables, confidentiality and ownership terms in writing.
6. Approve and record the engagement before work starts.
7. Assign least-privilege access and provide onboarding.
8. Track work, milestones, time where relevant, blockers and evidence.
9. Review deliverables against acceptance criteria.
10. Approve compensation, record payment status and reconcile the evidence.
11. Close access, preserve required records and collect feedback.

This is a management and recordkeeping capability. It does not itself hire anyone, create a legal employment relationship, calculate statutory payroll obligations conclusively, hold funds, or execute payments.

## 2. Participant categories

Support distinct engagement pathways rather than treating everyone as a contractor:

- **Employee:** ongoing employment relationship, subject to applicable employment law, payroll, statutory benefits and employer obligations.
- **Independent contractor / specialist:** scoped services with a written independent-services agreement, subject to the actual legal classification test in the relevant jurisdiction.
- **Temporary or project worker:** short-duration work; classification and obligations must be checked rather than inferred from the short duration.
- **Volunteer / contributor:** unpaid participation only where lawful and genuinely voluntary; never use this category to disguise productive paid work.
- **Partner / advisor:** defined advisory or collaboration arrangement, with compensation or equity terms separately approved and documented.

The platform must not decide legal status solely from a dropdown. Actual working arrangements, control, dependency, exclusivity, tools, duration and local law can affect classification. Flag uncertain cases for qualified local review before engagement.

## 3. Core records and relationships

The initial domain model should include:

| Record | Purpose | Essential information |
|---|---|---|
| Participant | Person or business being considered/engaged | Display name, contact reference, country/jurisdiction, capability tags, status, verification state |
| Role / work package | Defined capacity need | Title, business purpose, skills, scope, estimated effort, priority, budget ceiling, owner |
| Application / candidate assessment | Fair evaluation | Candidate reference, criteria, evidence links, assessment, decision and reason |
| Engagement | Approved relationship | Participant, engagement category, jurisdiction, agreement reference/version, start/end, approver, status |
| Assignment | Specific work allocated | Opportunity/project, owner, scope, due date, dependencies, access profile |
| Milestone / deliverable | Verifiable output | Description, acceptance criteria, evidence, reviewer, decision and timestamps |
| Time record | Time-based work evidence where applicable | Date, duration, task, submitter, approval state; never infer hours |
| Compensation term | Agreed payment basis | Fixed fee/hour/day/milestone, rate, currency, cap, schedule, effective date, agreement reference |
| Payment obligation | Amount approved as due | Gross agreed amount, currency, approved adjustments, due date, status, approver |
| Payment record | Evidence of an actual transfer | Provider reference, amount, currency, initiated/settled date, status, reconciliation evidence |
| Access grant | System permissions | Principal, resource, least-privilege role, grant/revoke timestamps, approver |
| Audit event | Accountability | Actor, action, record, timestamp, before/after reference, reason |

Relationships must be tenant/client scoped. A participant can have multiple applications or engagements, and an engagement can contain multiple assignments and milestones. Never use a single free-text field as the only record of compensation or payment.

## 4. Work and engagement lifecycle

Suggested controlled states:

- **Work package:** Draft → Budget review → Approved to recruit → Recruiting → Candidate selected → Engagement pending → Active → Paused / Blocked → Completed → Closed / Cancelled.
- **Candidate:** New → Screening → Assessment → Shortlisted → Selected / Declined / Withdrawn.
- **Engagement:** Draft → Legal/compliance review → Awaiting signature → Approved → Active → Suspended → Completed / Terminated.
- **Assignment:** Ready → In progress → Submitted → In review → Changes requested / Accepted → Closed.
- **Payment obligation:** Not eligible → Evidence pending → Submitted → Under review → Approved → Scheduled → Paid / Partially paid / Disputed / Cancelled.
- **Payment record:** Initiated → Pending provider confirmation → Settled / Failed / Reversed; only mark settled with reliable provider or bank evidence.

A candidate selection is not an engagement. An approved obligation is not proof of payment. A payment instruction is not a settled transfer.

## 5. Compensation and budget controls

Supported compensation structures:

- Fixed price for an accepted scope.
- Hourly or daily rate with an approved cap and submitted/approved time records.
- Milestone-based fee tied to objective acceptance criteria.
- Recurring retainer with service period, deliverables and cancellation terms.
- Employee payroll handled through a legally appropriate payroll process, not treated as an ordinary contractor invoice.

For every amount, store currency explicitly (initially SRD or USD where appropriate). Never silently convert or aggregate currencies. If conversion is needed, store original amount, conversion rate, rate source/date and converted reporting amount separately.

Each work package must have:
- Approved budget ceiling and currency.
- Funding source and availability status.
- Expected total cost, including platform/payment fees and any applicable taxes or statutory employer costs.
- Committed, approved, paid and remaining amounts as separate measures.
- A prohibition on assigning work beyond the approved funding ceiling without renewed approval.

No compensation should be promised based on speculative future revenue, unapproved grants, unconfirmed sponsorship, or an unverified customer payment.

## 6. Approval and separation of duties

Required controls:

- The work package owner defines scope and acceptance criteria.
- A budget approver authorizes the maximum commitment before recruitment or engagement.
- An authorized reviewer confirms candidate selection and engagement terms.
- A deliverable reviewer accepts or rejects evidence against the agreed criteria.
- A payment approver independently confirms the obligation and available funds.
- Payment execution, where later integrated, requires a separate explicit authorization and a verified provider route.
- The person who submits time or a deliverable should not be the sole approver of their own payment.
- Changes to rate, scope, budget, due date or beneficiary require a versioned amendment and approval before the changed work proceeds.

For a very small team where role separation is not practical, record the conflict and require a second-person review for higher-value commitments when available.

## 7. Legal, tax and jurisdiction checks

Before activating paid engagements, establish a jurisdiction checklist for the participant's work location and the contracting entity's location. For Suriname, obtain qualified local advice on employment classification, written agreement requirements, minimum pay, working time, leave, termination, payroll deductions, social insurance, income tax, invoicing, foreign-currency payments and cross-border contractor obligations as applicable.

Do not hard-code assumed tax rates or statutory deductions. Store the source, effective date and reviewer for any compliance rule. Escalate unclear classification, cross-border work, regulated activity, minors, sanctions concerns or sensitive personal-data processing for qualified review.

The system should collect only proportionate verification data. Avoid storing identity-document images, full bank credentials, card data, passwords or unnecessary sensitive information. Prefer a verified provider/beneficiary reference and store it only when necessary and access-controlled.

## 8. Payment and payout integration boundary

Initial release is **payment tracking only**:

- Record agreed compensation terms.
- Calculate a proposed amount from approved scope/time/milestones.
- Generate a reviewable payment request or invoice checklist.
- Require approval by an authorized person.
- Record provider/bank reference and settlement evidence after an actual transfer.
- Reconcile the amount, currency, fees, date and status.

Do not store bank login credentials, card numbers, wallet seed phrases or private keys. Do not implement custody, escrow, crypto transfers, automatic payroll, or direct money movement as part of this initial scope.

A future payment provider adapter may be evaluated only after confirming:
- The provider legally supports the business and participant countries.
- Onboarding/KYC and business eligibility.
- Supported payout currencies and recipient rails.
- Fees, FX spread, settlement times, reversals and chargeback rules.
- Tax/accounting exports, webhook signatures and idempotency.
- Data protection, auditability and a manual fallback.
- The user has approved the provider, fees, account connection and exact payment workflow.

Never report a payment as complete from a local database update alone; require authoritative provider or bank evidence.

## 9. Security and participant data

- Every record is tenant-scoped and protected by database authorization, not merely hidden in the UI.
- Candidate records are visible only to authorized recruiters/reviewers.
- Compensation and payment records have stricter permissions than general project records.
- Participants can access only their own engagement and assigned work data unless explicitly authorized.
- Client confidential information is disclosed only when necessary for the assignment and covered by the relevant agreement.
- Secrets and payment-provider credentials belong only in a server-side secret manager.
- Log administrative access, approval, compensation changes, access grants/revocations and payment-state changes.
- Define retention and deletion rules for unsuccessful candidates and completed engagements, subject to applicable legal recordkeeping requirements.
- Provide a way to correct inaccurate participant information and record the correction history.

## 10. Management dashboard

The operator view should show:

- Approved work packages and remaining budget.
- Open roles, candidate pipeline and selection status.
- Active participants, engagement expiry and missing agreements.
- Assignments, milestones, blockers and overdue work.
- Deliverables awaiting review and acceptance.
- Compensation obligations by currency and status.
- Payments awaiting approval, scheduled, settled or disputed.
- Participant access that must be reviewed or revoked.
- Compliance items and records missing required evidence.

Views must separate **forecast**, **committed**, **approved due**, and **actually paid**. SRD and USD remain separate.

## 11. Phased implementation

### Phase A — Policy and data foundation
- Approve the role taxonomy, work-package template and engagement lifecycle.
- Define jurisdiction and compliance review checklist.
- Define compensation and budget controls.
- Map participant, work-package, engagement, assignment, milestone, obligation and payment records.
- Decide tenant and participant access boundaries before schema creation.

### Phase B — Operational MVP
- Create and approve a funded work package.
- Register candidates and record structured assessment.
- Select a candidate and prepare an engagement record.
- Record agreed compensation and scope.
- Assign tasks and milestones.
- Submit and review deliverables.
- Create an approved payment obligation and record settlement evidence manually.
- Test authorization, audit history, currency handling and mobile usability with synthetic data.

### Phase C — Controlled payout integration
- Evaluate legally supported providers and bank rails for Suriname and target participant countries.
- Implement one provider adapter only after eligibility, fees, security and approval workflow are verified.
- Keep human approval before every payout.
- Reconcile provider webhooks with independently verifiable settlement status.

### Phase D — Workforce scaling
- Add capacity planning, skill coverage, performance feedback, repeat engagement, contractor onboarding and role-based access reviews.
- Add multi-client isolation and reporting only after tenant security tests pass.

## 12. Acceptance criteria

The MVP is not complete until tests demonstrate that:

1. A work package cannot move to recruiting without approved budget and owner.
2. A candidate cannot become an active participant without an approved engagement record and required agreement status.
3. Assignments have explicit scope, owner, due date and acceptance criteria.
4. Compensation cannot exceed the approved cap without an approved amendment.
5. Time/milestone evidence is reviewable and cannot self-approve its own payment.
6. Payment obligations and payment records are distinct.
7. A payment cannot be marked settled without external settlement evidence.
8. SRD and USD values are never silently combined.
9. Unauthorized users cannot view or modify candidate, compensation or payment records.
10. Access can be revoked at engagement close.
11. Audit events preserve who changed sensitive records and why.
12. Synthetic tests, `npm test`, `npm run build`, migration review and live RLS checks pass before release.

## 13. Immediate implementation recommendation

Do not add a payroll or payout API yet. First finish the existing opportunity-to-delivery foundation and confirm the tenant/ownership model. Then introduce the workforce MVP as a separate, access-controlled domain linked to approved projects and milestones.

**Operating rule:** recruit only for defined work, commit only against approved funds, pay only for verified obligations, and record settlement only when independently evidenced.
