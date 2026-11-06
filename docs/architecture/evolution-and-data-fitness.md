# KairoSphere — Evolution, Replacement, and Data Fitness Doctrine

**Status:** Active engineering doctrine  
**Adopted:** 2026-11-06  
**Applies to:** Product architecture, application code, database schema, operational data, integrations, and agent-generated work.

## Governing principle

Preserve learning, not obsolete implementation.

The previous system is a source of evidence: its workflows, data contracts, failure modes, security boundaries, user feedback, and operational costs teach us what the next system must do differently. None of its architecture, schema, UI, records, or conventions is entitled to survive merely because it exists.

A replacement may be simpler, structurally different, and intentionally incompatible when that produces a more correct and useful system.

## 1. Architecture is provisional

For every major component, ask:
- What real user or business outcome does it produce?
- What evidence says its current design works?
- Which errors, workarounds, duplicated responsibilities, and constraints does it create?
- Is replacement cheaper and clearer than continued repair?
- What is the smallest coherent design that meets the requirement?

Do not preserve a module, table, API, workflow, or abstraction solely to maintain backward compatibility. Compatibility must have a named consumer, measurable value, and an explicit maintenance cost.

## 2. Data fitness, not data accumulation

Every data collection must have a defined purpose, owner, source, schema, lifecycle, access policy, and quality threshold.

Classify records as:
- **Operational:** validated and currently useful to an active workflow.
- **Reference:** trusted reusable information with provenance and a review date.
- **Evidence:** retained because it supports a decision, audit, delivery, or learning.
- **Quarantined:** incomplete, conflicting, malformed, untrusted, or awaiting review; excluded from production calculations and automation.
- **Expired:** no longer needed for its stated purpose and due for deletion under the retention policy.

Never promote sample, synthetic, inferred, stale, or unverified information into confirmed operational facts. Never let quarantined or expired records feed metrics, automation, recommendations, or client-facing outputs.

Duplicate, malformed, orphaned, unowned, and low-value records are defects to resolve, not assets to carry forward by default.

## 3. Replacement and migration workflow

When replacing a subsystem:
1. Document what the old subsystem actually does, including hidden dependencies and failure patterns.
2. Define the new outcome, data contract, invariants, and acceptance tests without copying the old structure by default.
3. Map old fields and records to the new contract as **retain**, **transform**, **quarantine**, or **retire**. Every mapping needs a reason.
4. Build the new subsystem against synthetic fixtures first.
5. Test validation, authorization, tenant isolation, failure recovery, and realistic workflows.
6. Run a migration preview with counts and examples: accepted, transformed, quarantined, rejected, and retired.
7. Compare outputs against business invariants, not merely row counts.
8. Switch the application to the new contract once acceptance criteria pass.
9. Monitor real use and emerging errors; revise the new design rather than accumulating compatibility patches.
10. Remove obsolete schema, code, jobs, and interfaces after dependency checks and an approved cutover.

A backup or export is a recovery mechanism, not a requirement to re-import obsolete data. Retention must have a purpose and expiry.

## 4. Production quality gates

Production data must be:
- owned and access-controlled;
- schema-valid and semantically meaningful;
- attributable to a source and timestamp;
- explicit about confidence/status (confirmed, user-entered, estimated, sample, inferred, or unknown);
- deduplicated where the domain requires uniqueness;
- subject to lifecycle and retention rules;
- excluded from downstream workflows when invalid or quarantined.

Enforce critical invariants at the database boundary as well as in the application. UI validation alone is not a data-quality control. Add automated tests for invalid states and authorization failures.

Do not create tables or fields speculatively. A schema element needs a named workflow, owner, lifecycle, and acceptance test.

## 5. Learning from errors

Treat every production defect as evidence:
- record the observed behavior and reproducible conditions;
- identify the root cause and the invariant that failed;
- determine whether the defect is local or systemic;
- correct the source of invalid state, not only its visible symptom;
- add a regression test;
- review whether other modules share the same flawed assumption;
- update the architecture decision or operating documentation when the lesson changes system design.

Do not normalize recurring errors into permanent exceptions. Do not hide failures by silently dropping records or reporting success.

## 6. Autonomy and consequential actions

Agents may inspect, model, refactor, replace, and implement reversible code/schema changes on reviewable branches within their granted repository permissions. They should choose the strongest coherent design rather than ask for approval on every ordinary engineering decision.

Production cutovers, destructive data deletion, live database migrations that can irreversibly alter data, access/security changes, public deployment, spending, and external commitments remain explicit approval gates. This is not a reason to preserve obsolete architecture: prepare the replacement, tests, migration preview, rollback plan, and exact cutover action so approval is informed and fast.

Never claim a migration, deployment, test, or external action succeeded without direct evidence.

## 7. Required implementation report

Every substantial change must report:
- old assumption or defect being retired;
- new structure and reason;
- files, schema, interfaces, and workflows changed;
- data disposition (retain/transform/quarantine/retire), if applicable;
- exact tests and build results;
- integration evidence and remaining unknowns;
- obsolete components ready for removal;
- next highest-value action.

**Decision rule:** Keep what demonstrably serves the new system. Transform what can be made valid. Quarantine what is uncertain. Retire what has no continuing purpose. Preserve the lessons throughout.
