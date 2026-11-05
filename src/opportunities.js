import { createOpportunity } from "./domain.js";

const TABLE = "opportunities";
const COLUMNS = "id,name,stage,amount,currency,organization,contact_name,lead_source,problem_statement,current_process,business_impact,urgency,problem_duration,desired_outcome,received_date,next_follow_up,created_at";

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
    currency: row.currency,
    organization: row.organization,
    contactName: row.contact_name,
    leadSource: row.lead_source,
    problemStatement: row.problem_statement,
    currentProcess: row.current_process,
    businessImpact: row.business_impact,
    urgency: row.urgency,
    problemDuration: row.problem_duration,
    desiredOutcome: row.desired_outcome,
    receivedDate: row.received_date,
    nextFollowUp: row.next_follow_up
  });
}

function toRow(valid) {
  return {
    name: valid.name,
    stage: valid.stage,
    amount: valid.amount,
    currency: valid.currency,
    organization: valid.organization,
    contact_name: valid.contactName,
    lead_source: valid.leadSource,
    problem_statement: valid.problemStatement,
    current_process: valid.currentProcess,
    business_impact: valid.businessImpact,
    urgency: valid.urgency,
    problem_duration: valid.problemDuration,
    desired_outcome: valid.desiredOutcome,
    received_date: valid.receivedDate,
    next_follow_up: valid.nextFollowUp
  };
}

export async function listOpportunities(client) {
  const rows = unwrap(await client.from(TABLE).select(COLUMNS).order("created_at", { ascending: false }));
  return rows.map(fromRow);
}

export async function createUserOpportunity(client, userId, input) {
  const valid = createOpportunity(input);
  const row = unwrap(await client.from(TABLE).insert({ user_id: userId, ...toRow(valid) }).select(COLUMNS).single());
  return fromRow(row);
}

export async function updateUserOpportunity(client, id, input) {
  const valid = createOpportunity({ ...input, id });
  const row = unwrap(await client.from(TABLE).update(toRow(valid)).eq("id", id).select(COLUMNS).single());
  return fromRow(row);
}

export async function deleteUserOpportunity(client, id) {
  unwrap(await client.from(TABLE).delete().eq("id", id));
}
