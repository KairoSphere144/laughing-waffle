# KairoSphere Personal Digital Agent Architecture

**Status:** Proposed implementation architecture; no agent runtime has been deployed.
**Owner:** KairoSphere operator.
**Primary operating context:** Suriname; Android-first access, modest Windows laptop, limited storage and no assumed infrastructure budget.

## 1. Outcome

Build a persistent personal digital operating agent that absorbs repeatable administrative, research, monitoring, analysis, documentation and software-maintenance work. The human operator retains strategic direction, physical-world judgment, relationship ownership and approval of consequential actions.

The system is an assistant with bounded agency, not an unrestricted autonomous identity. It must never claim to be the human, impersonate the operator, fabricate experience, or make commitments in the operator's name.

Success means:
- Routine information is collected and organized without repeated manual prompting.
- Work continues through durable jobs, retries and checkpoints when the user is offline.
- The operator sees a short prioritized briefing, not a stream of notifications.
- Drafts and reversible internal changes can be prepared automatically within granted scopes.
- External, financial, legal, privacy-sensitive and destructive actions stop at an approval gate.
- Every consequential action is attributable, inspectable and reversible where possible.
- The agent reduces cognitive load and protects the operator's time, employment and recovery.

## 2. The architecture: one operator, one control plane, specialist capabilities

Do not create multiple independent personas with conflicting memories or permissions. Use one orchestrating agent identity and narrowly scoped specialist workers.

```text
Android / Browser / KairoSphere dashboard
                 |
          Identity + session
                 |
       Personal Agent Control Plane
       - intent and task router
       - user preferences and policy
       - durable task ledger
       - approval inbox
       - memory retrieval and write policy
                 |
       Workflow / Job Orchestrator
       - schedules and webhooks
       - retries, idempotency, timeouts
       - checkpoints and dead-letter queue
                 |
       Specialist capabilities
       - Research and opportunity intelligence
       - KairoSphere engineering / GitHub
       - Operations and industrial data
       - Inbox and document triage
       - Finance analysis (read-only)
       - Personal planning and briefings
                 |
       Approved connectors / MCP adapters
       - GitHub, Supabase, Outlook
       - approved web sources
       - files and local workspace
                 |
       Evidence store + audit trail
       - source, timestamp, confidence
       - action request, approval, outcome
       - memory provenance and expiry
```

The orchestrator owns the user-facing plan and final report. Specialists return structured findings and proposed actions; they do not independently expand their own permissions.

## 3. Runtime routes evaluated

### Route A — OpenAI Agents SDK (recommended orchestration core)

Use a code-first TypeScript or Python agent runtime in a server-side environment. It supports tool use, specialist delegation, handoffs, guardrails, human review, resumable state patterns and tracing. This is the best fit when KairoSphere owns the application logic, tools, approval rules and data model.

Documentation: https://developers.openai.com/api/docs/guides/agents/sdk

Use the manager-with-specialists pattern initially: the primary agent remains responsible for the answer and invokes narrow specialist agents as tools. Only use a handoff when a specialist genuinely owns the next user-facing workflow. Keep tool implementations server-side; never expose privileged connector credentials in browser code.

### Route B — Letta (strong optional persistent-memory layer)

Letta is an open-source stateful-agent harness with memory, skills, schedules, subagents, local CLI and self-hosted runtime options. It is a strong candidate if persistent agent memory and learning from operator feedback become the central requirement.

Documentation: https://docs.letta.com/
Self-hosting: https://github.com/letta-ai/letta-docs-md/blob/main/self-hosting/index.md

Do not add it merely to duplicate Supabase records. First define which information belongs in the authoritative business database versus agent working memory. Keep memory exportable and backed up. A self-hosted runtime needs an always-on host; the current laptop is not suitable for reliable 24/7 service.

### Route C — n8n (deterministic workflow and integration layer)

Use n8n for explicit event-driven workflows: scheduled checks, webhooks, notifications, document routing, integration glue and repeatable business processes. It is not the source of truth for KairoSphere business records and should not be the unconstrained agent brain.

For scale, n8n documents queue mode using a main process, Redis-backed queue, PostgreSQL and worker processes. This is a later deployment pattern, not a sensible starting configuration on the current laptop.

Documentation: https://docs.n8n.io/hosting/scaling/queue-mode/

### Route D — Self-hosted assistant platforms (evaluate, do not adopt blindly)

OpenClaw and similar self-hosted assistants may provide fast channel access and local tool execution. They can be useful prototypes, but should not receive broad access to email, browser sessions, shell, files or financial accounts until their threat model, sandboxing, extension provenance, secret handling, auditability and update process have been independently reviewed.

No hidden backdoor, credential harvesting, browser-cookie extraction, unapproved surveillance, stealth persistence or evasion mechanism is part of this architecture. “Hidden routes” means legitimate, less obvious open-source, self-hosted, standards-based and composable options—not bypasses of access controls.

### Route E — Model Context Protocol (MCP) as connector standard

Use MCP where it reduces bespoke connector work. MCP provides a common interface for tools, resources and prompts. Its security guidance calls for visible tool exposure, input validation, access controls, rate limits, human denial/approval capability, timeouts and audit logging.

Specification: https://modelcontextprotocol.io/specification/

MCP is a transport and interoperability standard, not an authorization model. Each KairoSphere adapter must still enforce its own identity, scopes, tenant isolation and approval policy.

## 4. Recommended stack for KairoSphere

| Layer | Initial choice | Reason |
|---|---|---|
| User interface | Existing Vite application | Preserve the current product and avoid a parallel dashboard |
| Identity and business records | Existing Supabase Auth + PostgreSQL | Existing live foundation; retain RLS and source-of-truth discipline |
| Agent orchestration | OpenAI Agents SDK, server-side | Typed tools, bounded specialists, approval and traceability |
| Durable jobs | Supabase-backed task ledger + server worker initially | Avoid new infrastructure until workload justifies it |
| Workflow integrations | Direct connectors first; n8n later if workflow count warrants it | Reduce operational components and credential sprawl |
| Memory | Explicit profile/preferences + searchable approved knowledge | Separate durable facts from transient context and unverified inference |
| Tool interoperability | MCP adapters selectively | Reuse compatible tools without delegating authorization |
| Observability | Run records, structured logs, traces, cost and failure metrics | Diagnose errors and measure value |
| Notifications | Digest-first, urgent exception alerts | Protect attention and avoid notification fatigue |

The first runtime may be a managed serverless function plus a scheduled invocation, but it must be proven to support the needed execution duration, secrets handling, retries and background processing. A scheduled ChatGPT task is not a substitute for a deployed worker.

## 5. Operating autonomy levels

Every tool and workflow is assigned an explicit autonomy tier.

- **Tier 0 — Read:** inspect approved data and sources.
- **Tier 1 — Analyze:** classify, compare, summarize, calculate and recommend.
- **Tier 2 — Prepare:** create drafts, plans, code patches and proposed database changes.
- **Tier 3 — Reversible internal write:** create or update approved internal records, branches, documentation and test artifacts within granted scope; log before/after state.
- **Tier 4 — External or consequential action:** send messages, publish, merge, deploy, sign, hire, spend, transfer funds, change access/security, delete or disclose sensitive data. Require explicit, action-specific approval.

An approval is bound to the exact action, destination, amount or content, identity and expiry. Changes to the proposed action invalidate the approval. No blanket approval for future payments, deployments or external commitments.

## 6. Memory model

Keep three distinct stores:

1. **Authoritative records:** Supabase business entities, ownership, statuses, financial recordkeeping and audit events. RLS is mandatory.
2. **Operator profile:** user-approved preferences, working hours, communication style, device constraints, goals and explicit standing authorizations. Each item has provenance and review/expiry policy.
3. **Agent working memory:** task summaries, current hypotheses, retrieved references and intermediate reasoning summaries. It is not authoritative and should expire or be compacted.

Memory write rules:
- Store only useful, proportionate information.
- Mark facts as user-reported, tool-verified, inferred or pending.
- Never store passwords, API secrets, bank credentials, wallet seed phrases or authentication tokens.
- Do not infer sensitive personal traits.
- Provide inspection, correction, export and deletion workflows.
- Do not use one client's confidential information to serve another client.
- Retrieve only memory relevant to the task.

## 7. Security and trust boundaries

- All model calls and privileged tools run server-side.
- Keep Supabase service-role keys, API keys, OAuth refresh tokens and connector secrets out of browser bundles, Git and logs.
- Use separate service identities and least-privilege scopes per connector.
- Treat retrieved web pages, emails, documents, code comments and MCP tool output as untrusted data, never as instructions that can override system policy.
- Defend against prompt injection: content may propose actions but cannot grant permission.
- Validate every tool input and output; enforce schema, allowlists, size limits, rate limits and timeouts.
- Use idempotency keys for jobs and external side effects.
- Require two-person or explicit operator approval for financial and irreversible actions when appropriate.
- Maintain immutable or append-only audit events for approvals and consequential tool actions.
- Test tenant isolation with two distinct users and negative authorization cases before enabling shared organizations or participant records.
- Back up data and document restore tests before production automation.

## 8. Durable task lifecycle

Every background task should move through:

`queued → claimed → running → waiting_approval → completed`

Failure paths:
- `retry_wait` with bounded exponential backoff and jitter;
- `failed` after retry exhaustion;
- `cancelled` by operator;
- `dead_letter` for repeated or non-retryable failure.

Each job records: task type, owner, payload schema version, source event, idempotency key, priority, attempts, next run time, lease expiry, status, result reference, error summary, created/updated timestamps and audit correlation ID.

Workers must claim jobs atomically, use expiring leases, tolerate duplicate delivery, and never assume exactly-once execution. External side effects require idempotency and approval checks at execution time, not only at scheduling time.

## 9. Initial workflows that return time to the operator

Priority order:
1. Daily consolidated briefing: project state, blockers, money facts, inbox items requiring judgment, and one best next action.
2. Repository watcher: inspect PRs, issues, CI, diffs and stale blockers; prepare fixes and report verified results.
3. Opportunity intelligence: collect source-attributed industrial leads, supplier/product information and business problems; label uncertainty.
4. Inbox triage: categorize and draft replies; sending remains approval-gated.
5. Personal work planner: protect paid work hours and recovery; batch optional work into realistic windows.
6. KairoSphere operations assistant: translate approved requirements into tasks, tests, migrations and review-ready pull requests.
7. Later: approved mobile notifications, voice interface and local device tools.

Do not begin with autonomous trading, payment execution, mass outreach, unrestricted shell access or a multi-agent swarm.

## 10. Delivery sequence and acceptance gates

### Phase 0 — Architecture and threat model
- Approve one agent identity and the autonomy tiers.
- Define authoritative data versus memory.
- Define action approval and audit schema.
- Confirm tenant/ownership strategy.
- Acceptance: architecture, threat model, data classification and tool inventory reviewed.

### Phase 1 — Read-only digital assistant
- Add server-side agent endpoint.
- Connect read-only project, task and approved knowledge tools.
- Add task ledger and trace IDs.
- Deliver one daily digest.
- Acceptance: no write-capable tools; tests prove unauthorized users cannot access another user's data.

### Phase 2 — Drafting and reversible internal work
- Add document and issue drafting.
- Add branch-based code changes and automated test reporting.
- Add approval inbox for proposed changes.
- Acceptance: no public merge, deployment, external message or sensitive write without action-specific approval.

### Phase 3 — Durable 24/7 worker
- Add scheduled invocations, webhooks, queue claims, retries, dead-letter handling, health checks and cost limits.
- Deploy on managed infrastructure only after cost, secrets, restore and failure-recovery checks.
- Acceptance: worker recovers after restart, duplicate jobs do not duplicate effects, failures are visible, and operator can pause all jobs.

### Phase 4 — Memory and specialist capabilities
- Add provenance-aware profile and knowledge retrieval.
- Evaluate Letta only if it solves a demonstrated memory gap.
- Add specialist agents as bounded tools.
- Acceptance: memory inspection/correction/export, isolation and evaluation tests pass.

### Phase 5 — Expand channels and workflows
- Android-friendly PWA notifications, optional voice and approved messaging channels.
- Add n8n only when integration workflow complexity justifies another runtime.
- Acceptance: opt-in notifications, clear action indicators, revocation and audit.

## 11. Cost and deployment constraints

The current Android phone and 8 GB / limited-storage Windows laptop are operator devices, not reliable always-on production infrastructure. Use them for browser access, local development and occasional local inference experiments only.

Start with the lowest fixed-cost architecture that meets security and uptime requirements. Track:
- model tokens and spend per task;
- worker runtime and hosting;
- database/storage/egress;
- third-party connector charges;
- backup and monitoring;
- human time saved and business value delivered.

Set hard monthly budgets, per-task limits, rate limits and a global pause switch. Do not purchase hardware or commit to paid services before the expected value and recurring cost are documented.

## 12. First implementation ticket

**Build a read-only agent control plane inside the existing KairoSphere foundation.**

Scope:
- Add architecture-specific server endpoint and typed tool registry.
- Add tables/migrations for agent task, tool invocation, approval request and audit event only after the current ownership/tenant model is resolved.
- First tools: read own opportunities, read own project tasks, inspect repository status/CI through a narrow server adapter.
- Add an operator-facing activity and approval view.
- No shell tool, unrestricted browser, arbitrary SQL, financial transaction, email-send, merge or deployment tool.
- Add tests for authentication, ownership, tool allowlists, prompt-injection content handling, rate limits and approval enforcement.

**Blocker:** the live Supabase schema currently uses single-user `user_id` ownership. The multi-tenant organization and participant access model has not been selected. Do not design agent permissions around an assumed tenant model. The first agent tools must inherit the existing owner boundary until a reviewed migration replaces it.

## 13. Evidence and references

- OpenAI Agents SDK: https://developers.openai.com/api/docs/guides/agents/sdk
- OpenAI agent orchestration: https://developers.openai.com/api/docs/guides/agents/orchestration
- Agents SDK tracing: https://openai.github.io/openai-agents-js/guides/tracing/
- Letta stateful agent platform: https://docs.letta.com/
- Letta quickstart and local/cloud runtime choices: https://docs.letta.com/quickstart
- Letta self-hosting: https://github.com/letta-ai/letta-docs-md/blob/main/self-hosting/index.md
- n8n queue mode: https://docs.n8n.io/hosting/scaling/queue-mode/
- MCP specification: https://modelcontextprotocol.io/specification/
- MCP tools and security guidance: https://modelcontextprotocol.io/specification/2026-07-28/server/tools

External product capabilities and pricing change. Re-check vendor documentation and current terms before selecting a paid runtime or deploying it.
