import { normalizeMovement, normalizeProduct, normalizeWarehouse } from "./inventory-domain.js";

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

export async function listOrganizations(client) {
  return unwrap(await client.from("organizations").select("id,name,created_at").order("created_at", { ascending: true }));
}

export async function createOrganization(client, userId, name) {
  const normalized = String(name ?? "").trim();
  if (normalized.length < 2 || normalized.length > 120) throw new Error("Company name must contain 2–120 characters.");
  const organization = unwrap(await client.from("organizations").insert({ name: normalized, created_by: userId }).select("id,name,created_at").single());
  unwrap(await client.from("organization_members").insert({ organization_id: organization.id, user_id: userId, role: "owner" }));
  return organization;
}

export async function listWarehouses(client, organizationId) {
  return unwrap(await client.from("warehouses").select("id,code,name,location,is_active").eq("organization_id", organizationId).eq("is_active", true).order("name"));
}

export async function createWarehouse(client, organizationId, input) {
  const valid = normalizeWarehouse(input);
  return unwrap(await client.from("warehouses").insert({ organization_id: organizationId, ...valid }).select("id,code,name,location,is_active").single());
}

export async function listProducts(client, organizationId) {
  return unwrap(await client.from("products").select("id,sku,name,description,unit,reorder_point,unit_cost,cost_currency,is_active").eq("organization_id", organizationId).eq("is_active", true).order("name"));
}

export async function createProduct(client, organizationId, input) {
  const valid = normalizeProduct(input);
  return unwrap(await client.from("products").insert({
    organization_id: organizationId, sku: valid.sku, name: valid.name, unit: valid.unit,
    reorder_point: valid.reorderPoint, unit_cost: valid.unitCost, cost_currency: valid.costCurrency
  }).select("id,sku,name,description,unit,reorder_point,unit_cost,cost_currency,is_active").single());
}

export async function listInventoryBalances(client, organizationId) {
  return unwrap(await client.from("inventory_balances").select("*").eq("organization_id", organizationId).order("product_name"));
}

export async function listStockMovements(client, organizationId, limit = 30) {
  return unwrap(await client.from("stock_movements").select("id,warehouse_id,product_id,movement_type,quantity_delta,reference,notes,created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(limit));
}

export async function recordStockMovement(client, userId, organizationId, input) {
  const valid = normalizeMovement(input);
  return unwrap(await client.from("stock_movements").insert({
    organization_id: organizationId, warehouse_id: input.warehouseId, product_id: input.productId,
    movement_type: valid.movementType, quantity_delta: valid.quantityDelta,
    reference: valid.reference, notes: valid.notes, recorded_by: userId
  }).select("id,warehouse_id,product_id,movement_type,quantity_delta,reference,notes,created_at").single());
}
