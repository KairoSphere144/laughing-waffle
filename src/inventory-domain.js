export const MOVEMENT_TYPES = Object.freeze(["receipt", "issue", "adjustment"]);

export function normalizeProduct(input) {
  const sku = String(input?.sku ?? "").trim().toUpperCase();
  const name = String(input?.name ?? "").trim();
  const unit = String(input?.unit ?? "each").trim() || "each";
  const reorderPoint = Number(input?.reorderPoint ?? 0);
  const unitCost = Number(input?.unitCost ?? 0);
  const currency = String(input?.costCurrency ?? "SRD").toUpperCase();
  if (!sku || sku.length > 64) throw new Error("SKU must contain 1–64 characters.");
  if (!name || name.length < 2 || name.length > 160) throw new Error("Product name must contain 2–160 characters.");
  if (unit.length > 24) throw new Error("Unit must contain no more than 24 characters.");
  if (!Number.isFinite(reorderPoint) || reorderPoint < 0) throw new Error("Reorder point cannot be negative.");
  if (!Number.isFinite(unitCost) || unitCost < 0) throw new Error("Unit cost cannot be negative.");
  if (!["SRD", "USD"].includes(currency)) throw new Error("Cost currency must be SRD or USD.");
  return { sku, name, unit, reorderPoint: Math.round(reorderPoint * 1000) / 1000, unitCost: Math.round(unitCost * 100) / 100, costCurrency: currency };
}

export function normalizeWarehouse(input) {
  const code = String(input?.code ?? "").trim().toUpperCase();
  const name = String(input?.name ?? "").trim();
  const location = String(input?.location ?? "").trim();
  if (!code || code.length > 24) throw new Error("Warehouse code must contain 1–24 characters.");
  if (!name || name.length < 2 || name.length > 100) throw new Error("Warehouse name must contain 2–100 characters.");
  if (location.length > 120) throw new Error("Warehouse location must contain no more than 120 characters.");
  return { code, name, location: location || null };
}

export function normalizeMovement(input) {
  const movementType = String(input?.movementType ?? "").toLowerCase();
  const quantity = Number(input?.quantity);
  if (!MOVEMENT_TYPES.includes(movementType)) throw new Error("Choose a valid stock movement.");
  if (!Number.isFinite(quantity) || quantity === 0) throw new Error("Quantity must be a non-zero number.");
  if (movementType === "receipt" && quantity < 0) throw new Error("A receipt quantity must be positive.");
  if (movementType === "issue" && quantity < 0) throw new Error("Enter an issue quantity as a positive number.");
  const rounded = Math.round(quantity * 1000) / 1000;
  if (Math.abs(quantity - rounded) > 1e-9 || rounded === 0) throw new Error("Quantity supports up to three decimal places.");
  return {
    movementType,
    quantityDelta: movementType === "issue" ? -Math.abs(rounded) : rounded,
    reference: String(input?.reference ?? "").trim() || null,
    notes: String(input?.notes ?? "").trim() || null
  };
}

export function summarizeInventory(rows) {
  const records = Array.isArray(rows) ? rows : [];
  return {
    skuCount: new Set(records.map(row => row.product_id)).size,
    warehouseCount: new Set(records.map(row => row.warehouse_id)).size,
    lowStockCount: records.filter(row => Number(row.reorder_point) > 0 && Number(row.quantity_on_hand) <= Number(row.reorder_point)).length,
    negativeStockCount: records.filter(row => Number(row.quantity_on_hand) < 0).length,
    unitsOnHand: records.reduce((sum, row) => sum + Number(row.quantity_on_hand || 0), 0)
  };
}
