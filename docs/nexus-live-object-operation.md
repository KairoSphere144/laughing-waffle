# Nexus Live Object Operation Layer

## Purpose
Enable Nexus to receive information about real-world objects, converse about their state, perform authorized operations through adapters, and return auditable results. The interface must distinguish data observed live, user-entered data, simulation, and verified execution.

## Object lifecycle
1. Receive: user description, image, identifier, measurement, sensor feed or adapter event.
2. Identify: assign or resolve an object identity; preserve uncertain identification as unverified.
3. Register: assign object to a numbered space (starting at 1); record source, timestamp and confidence.
4. Observe: capture state, condition, location, measurements and limitations.
5. Converse: allow questions and commands scoped to this object and current state.
6. Plan: translate requests into operations; show proposed action and impact.
7. Authorize: require explicit permission for consequential actions. Physical actuation requires device-specific safety interlocks and an authorized adapter.
8. Execute: dispatch through adapter; simulation is clearly labelled and must not imply real operation.
9. Output: return operation result, status, source, timestamp and evidence.
10. Verify: confirm result from independent observation/adapter response. Do not mark successful solely because command was sent.
11. Continue: persist state and resume from last verified state; failures route to recovery.

## Data provenance statuses
- user-entered: supplied by user; not independently confirmed
- observed: source returned a measurement/event
- simulated: demonstration or model-only result
- executed: adapter reports operation completion; verification may still be pending
- verified: independent/defined verification criterion satisfied
- stale: live source exceeds its configured freshness limit
- failed: operation failed; include recovery pathway

## Adapter boundary
Adapters implement read/observe, operation dispatch, health/status, and verification. Adapter registration must include capability list, authorization policy, source attribution, timeout, failure mode, and safety requirements. Default adapter is non-actuating and demo-only.

## Conversation routing
Resolve a conversation request to object ID and space, check authorization and freshness, gather state, plan response/action, execute only if permitted, and return an auditable output. If identity or state is ambiguous, ask one targeted question instead of guessing.

## Initial deliverable
This contract is architectural groundwork. It does not yet connect to a real device, sensor, data provider or actuator. A functional live connection requires a specific object/device or data source and adapter credentials/configuration, kept outside the repository.
