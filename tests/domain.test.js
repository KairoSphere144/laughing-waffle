import test from "node:test";
import assert from "node:assert/strict";
import { createOpportunity, summarizePipeline, formatMoney } from "../src/domain.js";

test("creates a normalized opportunity with optional problem-intake fields", () => {
  const result = createOpportunity({
    name: "  Pump supply  ", stage: "qualified", amount: "125.456", currency: "usd",
    organization: "  Acme  ", problemStatement: "  Missing product identifiers  ",
    urgency: "high", problemDuration: "recurring", id: "test-1"
  });
  assert.equal(result.id, "test-1");
  assert.equal(result.name, "Pump supply");
  assert.equal(result.amount, 125.46);
  assert.equal(result.currency, "USD");
  assert.equal(result.organization, "Acme");
  assert.equal(result.problemStatement, "Missing product identifiers");
  assert.equal(result.urgency, "high");
  assert.equal(result.problemDuration, "recurring");
  assert.equal(result.dataStatus, "user-entered");
});

test("allows unknown amount and unknown intake details without inventing values", () => {
  const result = createOpportunity({ name: "Initial discovery", amount: "", currency: "USD" });
  assert.equal(result.amount, null);
  assert.equal(result.organization, null);
  assert.equal(result.problemStatement, null);
  assert.equal(result.urgency, "unknown");
  assert.equal(result.problemDuration, "unknown");
  assert.equal(formatMoney(result.amount, result.currency), "Not estimated");
});

test("rejects invalid stages, non-positive values, unsupported currencies and invalid classifications", () => {
  assert.throws(() => createOpportunity({ name: " ", amount: 1 }), /opportunity name/i);
  assert.throws(() => createOpportunity({ name: "Valid", stage: "won", amount: 1 }), /stage/i);
  assert.throws(() => createOpportunity({ name: "Valid", amount: 0 }), /positive/i);
  assert.throws(() => createOpportunity({ name: "Valid", amount: "NaN" }), /positive/i);
  assert.throws(() => createOpportunity({ name: "Valid", amount: 1, currency: "EUR" }), /currency/i);
  assert.throws(() => createOpportunity({ name: "Valid", amount: "", urgency: "urgent" }), /urgency/i);
  assert.throws(() => createOpportunity({ name: "Valid", amount: "", problemDuration: "forever" }), /duration/i);
  assert.throws(() => createOpportunity({ name: "Valid", amount: "", nextFollowUp: "tomorrow" }), /follow-up date/i);
});

test("summarizes USD and SRD independently without mixing currencies or counting unknown values", () => {
  const summary = summarizePipeline([
    { amount: 12.25, currency: "USD" },
    { amount: 80, currency: "SRD" },
    { amount: 7.75, currency: "USD" },
    { amount: null, currency: "USD" }
  ]);
  assert.deepEqual(summary, { count: 4, totals: { USD: 20, SRD: 80 } });
});

test("handles an empty pipeline", () => {
  assert.deepEqual(summarizePipeline([]), { count: 0, totals: { USD: 0, SRD: 0 } });
});

test("formats supported currencies", () => {
  assert.match(formatMoney(25, "USD"), /25/);
  assert.match(formatMoney(25, "SRD"), /25/);
});
