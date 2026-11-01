import test from "node:test";
import assert from "node:assert/strict";
import { createUserOpportunity, deleteUserOpportunity, listOpportunities, updateUserOpportunity } from "../src/opportunities.js";

function mockClient({ data = [], error = null } = {}) {
  const calls = [];
  let response = { data, error };
  const query = {
    select(columns) { calls.push(["select", columns]); return this; },
    order(column, options) { calls.push(["order", column, options]); return this; },
    insert(values) { calls.push(["insert", values]); return this; },
    update(values) { calls.push(["update", values]); return this; },
    delete() { calls.push(["delete"]); return this; },
    eq(column, value) { calls.push(["eq", column, value]); return this; },
    single() { return Promise.resolve(response); },
    then(resolve, reject) { return Promise.resolve(response).then(resolve, reject); }
  };
  return { calls, from(table) { calls.push(["from", table]); return query; }, setResponse(next) { response = next; } };
}

test("lists opportunities through the authenticated table query and normalizes rows", async () => {
  const client = mockClient({ data: [{ id: "a", name: " Pump ", stage: "lead", amount: "10.50", currency: "USD" }] });
  const rows = await listOpportunities(client);
  assert.equal(rows[0].name, "Pump");
  assert.equal(rows[0].amount, 10.5);
  assert.deepEqual(client.calls[0], ["from", "opportunities"]);
  assert.ok(client.calls.some(call => call[0] === "order"));
});

test("creates records with the authenticated user's id and validated fields", async () => {
  const client = mockClient({ data: { id: "db-id", name: "Pump", stage: "qualified", amount: 25, currency: "SRD" } });
  const created = await createUserOpportunity(client, "user-123", { name: " Pump ", stage: "qualified", amount: "25", currency: "srd" });
  const insert = client.calls.find(call => call[0] === "insert")[1];
  assert.deepEqual(insert, { user_id: "user-123", name: "Pump", stage: "qualified", amount: 25, currency: "SRD" });
  assert.equal(created.id, "db-id");
});

test("updates and deletes only the selected row id; RLS remains the ownership boundary", async () => {
  const client = mockClient({ data: { id: "row-1", name: "Revised", stage: "lead", amount: 10, currency: "USD" } });
  await updateUserOpportunity(client, "row-1", { name: "Revised", stage: "lead", amount: 10, currency: "USD" });
  assert.ok(client.calls.some(call => call[0] === "eq" && call[1] === "id" && call[2] === "row-1"));
  client.setResponse({ data: null, error: null });
  await deleteUserOpportunity(client, "row-1");
  assert.ok(client.calls.some(call => call[0] === "delete"));
});

test("rejects invalid input before writing to Supabase and propagates database errors", async () => {
  const client = mockClient({ data: null, error: new Error("permission denied") });
  await assert.rejects(createUserOpportunity(client, "user-123", { name: "", amount: 1 }), /opportunity name/i);
  assert.equal(client.calls.length, 0);
  await assert.rejects(listOpportunities(client), /permission denied/);
});
