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

test("lists opportunities including problem-intake fields", async () => {
  const client = mockClient({ data: [{
    id: "a", name: " Pump ", stage: "lead", amount: null, currency: "USD",
    organization: "Acme", contact_name: null, lead_source: "Referral",
    problem_statement: "Parts data is incomplete", current_process: null, business_impact: null,
    urgency: "unknown", problem_duration: "unknown", desired_outcome: null, next_follow_up: null
  }] });
  const rows = await listOpportunities(client);
  assert.equal(rows[0].name, "Pump");
  assert.equal(rows[0].amount, null);
  assert.equal(rows[0].organization, "Acme");
  assert.equal(rows[0].problemStatement, "Parts data is incomplete");
  assert.ok(client.calls.some(call => call[0] === "select" && call[1].includes("problem_statement")));
});

test("creates records with the authenticated user's id and validated intake fields", async () => {
  const client = mockClient({ data: {
    id: "db-id", name: "Pump", stage: "qualified", amount: null, currency: "SRD",
    organization: "Acme", contact_name: null, lead_source: "Email",
    problem_statement: "Catalogue needs cleanup", current_process: null, business_impact: null,
    urgency: "normal", problem_duration: "one_off", desired_outcome: "Structured list", next_follow_up: null
  } });
  const created = await createUserOpportunity(client, "user-123", {
    name: " Pump ", stage: "qualified", amount: "", currency: "srd",
    organization: " Acme ", leadSource: "Email", problemStatement: "Catalogue needs cleanup",
    urgency: "normal", problemDuration: "one_off", desiredOutcome: "Structured list"
  });
  const insert = client.calls.find(call => call[0] === "insert")[1];
  assert.equal(insert.user_id, "user-123");
  assert.equal(insert.name, "Pump");
  assert.equal(insert.amount, null);
  assert.equal(insert.organization, "Acme");
  assert.equal(insert.problem_statement, "Catalogue needs cleanup");
  assert.equal(created.id, "db-id");
});

test("updates and deletes only the selected row id; RLS remains the ownership boundary", async () => {
  const client = mockClient({ data: {
    id: "row-1", name: "Revised", stage: "lead", amount: 10, currency: "USD",
    urgency: "unknown", problem_duration: "unknown"
  } });
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
