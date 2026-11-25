const STORAGE_KEY = "nexus.objects.v1";
const ACTIONS = ["inspect", "describe", "status", "simulate"];

export function parseObjectInput(raw, nextIndex = 1) {
  const description = String(raw ?? "").trim();
  if (!description || description.length > 500) throw new Error("Enter a description (1–500 characters).");
  return { space_id: "SPACE-1", space_index: 1, object_id: `OBJ-1-${nextIndex}`,
    object_type: "user-described-object", description, identity_status: "identified-unverified",
    source: "user-entered", observed_at: new Date().toISOString(), state: "idle",
    adapter: "safe-demo-adapter", physical_actuation: false, operations_supported: ACTIONS };
}
export function processObjectCommand(object, command) {
  const normalized = String(command ?? "").trim().toLowerCase();
  if (!object || !object.object_id) throw new Error("Select or create an object first.");
  if (!ACTIONS.includes(normalized)) throw new Error("Supported commands: inspect, describe, status, simulate. Physical actuation is not enabled.");
  const timestamp = new Date().toISOString();
  let result;
  if (normalized === "describe") result = object.description;
  if (normalized === "status") result = `State: ${object.state}; identity: ${object.identity_status}; source: ${object.source}.`;
  if (normalized === "inspect") result = `Record ${object.object_id} in ${object.space_id}. Type: ${object.object_type}. Description: ${object.description}. No external device or sensor connection is established.`;
  if (normalized === "simulate") result = `Simulation completed for ${object.object_id}; no physical device was contacted or actuated.`;
  return { operation_id: `NEX-${Date.now()}`, object_id: object.object_id, command: normalized, result,
    result_status: "simulated", source: normalized === "simulate" ? "safe-demo-adapter" : "object-registry",
    timestamp, verification: "Console response generated; not a physical observation or execution." };
}
export function formatHumanOutput(payload) {
  if (typeof payload === "string") return payload;
  if (payload?.operation_id) return [
    `STATUS: ${String(payload.result_status || "unknown").toUpperCase()}`,
    `RESULT: ${payload.result || "No result provided."}`,
    `OBJECT: ${payload.object_id || "n/a"}${payload.command ? ` · COMMAND: ${payload.command}` : ""}`,
    `SOURCE: ${payload.source || "unspecified"}`,
    `TIME: ${payload.timestamp || "unspecified"}`,
    `VERIFICATION: ${payload.verification || "Not verified"}`,
    `NEXT: ${payload.result_status === "simulated" ? "Connect an authorized real data source or adapter to obtain live evidence." : "Review the evidence and proceed."}`
  ].join("\\n");
  if (payload?.created) return `REGISTERED: ${payload.created.object_id}\nSPACE: ${payload.created.space_id}\nSTATE: ${payload.created.state}\nIDENTITY: ${payload.created.identity_status}\nDESCRIPTION: ${payload.created.description}\nSAVE: ${payload.persistence}`;
  return JSON.stringify(payload, null, 2);
}
export function initNexusConsole() {
  const form = document.querySelector("#nexus-object-form");
  if (!form) return;
  const input = document.querySelector("#nexus-object-input");
  const selector = document.querySelector("#nexus-object-select");
  const command = document.querySelector("#nexus-command");
  const output = document.querySelector("#nexus-output");
  const log = document.querySelector("#nexus-log");
  let objects = [];
  try { objects = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { objects = []; }
  if (!Array.isArray(objects)) objects = [];
  function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(objects)); return true; } catch { return false; } }
  function populate() {
    selector.replaceChildren();
    objects.forEach(object => { const option = document.createElement("option"); option.value = object.object_id; option.textContent = `${object.object_id} · ${object.description.slice(0,60)}`; selector.append(option); });
    selector.disabled = objects.length === 0;
  }
  function active() { return objects.find(object => object.object_id === selector.value); }
  function show(value) { output.textContent = formatHumanOutput(value); }
  form.addEventListener("submit", event => {
    event.preventDefault();
    try { const object = parseObjectInput(input.value, objects.length + 1); objects.unshift(object); const saved = persist(); populate(); selector.value = object.object_id; input.value = "";
      show({ created: object, persistence: saved ? "Saved locally in this browser" : "Local save unavailable; record only in memory" });
    } catch(error) { show(error.message); }
  });
  document.querySelector("#nexus-command-form").addEventListener("submit", event => {
    event.preventDefault();
    try { const response = processObjectCommand(active(), command.value); show(response);
      const entry = document.createElement("li"); entry.textContent = `${response.timestamp} · ${response.object_id} · ${response.command} · ${response.result_status}`; log.prepend(entry);
    } catch(error) { show(error.message); }
  });
  selector.addEventListener("change", () => show(active() || "No object selected."));
  populate(); show(objects.length ? "Object registry restored from this browser." : "No objects yet. Describe an object above to create a record.");
}
