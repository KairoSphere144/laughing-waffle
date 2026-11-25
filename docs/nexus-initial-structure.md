# Nexus Initial State & Space Registry

Status: foundation blueprint (not yet runtime-wired)
Version: 0.1.0
Repository anchor: KairoSphere144/laughing-waffle

## Goal
Establish the minimal, extensible registry for states, routes, object spaces, transition checks, and recovery paths. Do not claim a state is configured until its validation checks pass.

## Numbering and multiplication
- Object-space indexing begins at **1** (never 0 for user-facing object slots).
- Multiplication is the scale rule: base capacity 1; scale tiers are 1×, 2×, 4×, 8×, 16×, etc. (doubling tiers are explicit, not automatic resource commitments).
- Each space has a unique ID, capacity tier, object IDs, dependencies, and validation status.
- Objects are assigned to spaces; object IDs and space IDs are separate namespaces.
- Scale-up preserves existing IDs and requires validation.

## Core state sequence
S0 origin/inventory → S1 mapping → S2 foundation → S3 architecture → S4 identity/access → S5 infrastructure → S6 connectivity → S7 intelligence → S8 operations → S9 resilience → S10 expansion → S11 adaptive feedback.

States may be parallelized when dependencies allow. A failed transition returns to its declared recovery route, not an assumed previous state.

## Required transition record
Each transition includes: from, to, trigger, prerequisites, guard/checks, action, success evidence, failure route, and owner (role, not personal identifier).

## Acceptance gates
1. Registry schema validates.
2. Every state has an exit condition and at least one recovery route.
3. Every transition has prerequisites and verification.
4. Object-space capacity tier is positive integer and follows supported multiplier tiers.
5. No secret is committed to the repository; secrets are references to protected vault entries only.
6. Main foundation state is marked configured only after all foundation acceptance checks pass.

## Initial foundation acceptance
- [ ] State registry created and schema checked
- [ ] Route graph defined
- [ ] Space index established from 1
- [ ] Multiplication capacity tiers documented
- [ ] Object model and ID namespaces documented
- [ ] Failure/recovery pathways specified
- [ ] Access and secret handling requirements defined
- [ ] Test coverage added before runtime integration
