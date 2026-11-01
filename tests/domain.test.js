import test from "node:test";
import assert from "node:assert/strict";
import { createOpportunity, summarizePipeline, formatMoney } from "../src/domain.js";

test("creates a normalized opportunity", () => {
  const result = createOpportunity({ name: "  Pump supply  ", stage: "qualified", amount: "125.456", currency: "usd", id: "test-1" });
  assert.deepEqual(result, {
    id: "test-1",
    name: "Pump supply",
    stage: "qualified",
    amount: 125.46,
    currency: "USD",
    dataStatus: "user-entered"
  });
});

test("rejects blank names, invalid stages, non-positive values and unsupported currencies", () => {
  assert.throws(() => createOpportunity({ name: " ", amount: 1 }), /opportunity name/i);
  assert.throws(() => createOpportunity({ name: "Valid", stage: "won", amount: 1 }), /stage/i);
  assert.throws(() => createOpportunity({ name: "Valid", amount: 0 }), /positive/i);
  assert.throws(() => createOpportunity({ name: "Valid", amount: "NaN" }), /positive/i);
  assert.throws(() => createOpportunity({ name: "Valid", amount: 1, currency: "EUR" }), /currency/i);
});

test("summarizes USD and SRD independently without mixing currencies", () => {
  const summary = summarizePipeline([
    { amount: 12.25, currency: "USD" },
    { amount: 80, currency: "SRD" },
    { amount: 7.75, currency: "USD" }
  ]);
  assert.deepEqual(summary, { count: 3, totals: { USD: 20, SRD: 80 } });
});

test("handles an empty pipeline", () => {
  assert.deepEqual(summarizePipeline([]), { count: 0, totals: { USD: 0, SRD: 0 } });
});

test("formats supported currencies", () => {
  assert.match(formatMoney(25, "USD"), /25/);
  assert.match(formatMoney(25, "SRD"), /25/);
});
