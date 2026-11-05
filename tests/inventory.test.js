import test from "node:test";
import assert from "node:assert/strict";
import { normalizeProduct, normalizeWarehouse, normalizeMovement, summarizeInventory } from "../src/inventory-domain.js";

test("normalizes product identifiers and cost metadata", () => {
  assert.deepEqual(normalizeProduct({ sku: " pump-01 ", name: "Pump", unit: "each", reorderPoint: "2", unitCost: "12.5", costCurrency: "srd" }), {
    sku: "PUMP-01", name: "Pump", unit: "each", reorderPoint: 2, unitCost: 12.5, costCurrency: "SRD"
  });
});

test("rejects invalid product identifiers and negative stock thresholds", () => {
  assert.throws(() => normalizeProduct({ sku: "", name: "Pump" }), /SKU/i);
  assert.throws(() => normalizeProduct({ sku: "P1", name: "P" }), /Product name/i);
  assert.throws(() => normalizeProduct({ sku: "P1", name: "Pump", reorderPoint: -1 }), /Reorder/i);
});

test("normalizes warehouse code and requires a name", () => {
  assert.deepEqual(normalizeWarehouse({ code: " main ", name: " Main Store ", location: "North" }), { code: "MAIN", name: "Main Store", location: "North" });
  assert.throws(() => normalizeWarehouse({ code: "", name: "Main" }), /code/i);
});

test("converts issue quantities to negative ledger entries", () => {
  assert.equal(normalizeMovement({ movementType: "issue", quantity: "3" }).quantityDelta, -3);
  assert.equal(normalizeMovement({ movementType: "receipt", quantity: "4" }).quantityDelta, 4);
  assert.equal(normalizeMovement({ movementType: "adjustment", quantity: "-2" }).quantityDelta, -2);
  assert.throws(() => normalizeMovement({ movementType: "issue", quantity: "-3" }), /positive/i);
  assert.throws(() => normalizeMovement({ movementType: "receipt", quantity: "-3" }), /positive/i);
});

test("summarizes distinct SKUs, warehouses, low stock and total units", () => {
  assert.deepEqual(summarizeInventory([
    { product_id: "p1", warehouse_id: "w1", quantity_on_hand: 2, reorder_point: 3 },
    { product_id: "p2", warehouse_id: "w1", quantity_on_hand: 8, reorder_point: 2 },
    { product_id: "p1", warehouse_id: "w2", quantity_on_hand: 4, reorder_point: 3 }
  ]), { skuCount: 2, warehouseCount: 2, lowStockCount: 1, unitsOnHand: 14 });
});
