import { createOpportunity } from "./domain.js";

const TABLE = "opportunities";

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

function fromRow(row) {
  return createOpportunity({
    id: row.id,
    name: row.name,
    stage: row.stage,
    amount: row.amount,
    currency: row.currency
  });
}

export async function listOpportunities(client) {
  const rows = unwrap(await client.from(TABLE).select("id,name,stage,amount,currency,created_at").order("created_at", { ascending: false }));
  return rows.map(fromRow);
}

export async function createUserOpportunity(client, userId, input) {
  const valid = createOpportunity(input);
  const row = unwrap(await client.from(TABLE).insert({
    user_id: userId,
    name: valid.name,
    stage: valid.stage,
    amount: valid.amount,
    currency: valid.currency
  }).select("id,name,stage,amount,currency").single());
  return fromRow(row);
}

export async function updateUserOpportunity(client, id, input) {
  const valid = createOpportunity({ ...input, id });
  const row = unwrap(await client.from(TABLE).update({
    name: valid.name,
    stage: valid.stage,
    amount: valid.amount,
    currency: valid.currency
  }).eq("id", id).select("id,name,stage,amount,currency").single());
  return fromRow(row);
}

export async function deleteUserOpportunity(client, id) {
  unwrap(await client.from(TABLE).delete().eq("id", id));
}
