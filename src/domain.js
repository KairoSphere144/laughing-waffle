export const OPPORTUNITY_STAGES = Object.freeze(["lead", "qualified", "proposal", "negotiation"]);
export const URGENCY_LEVELS = Object.freeze(["unknown", "low", "normal", "high", "critical"]);
export const PROBLEM_DURATIONS = Object.freeze(["unknown", "one_off", "recurring"]);

function optionalText(value, field, maxLength = 2000) {
  const text = String(value ?? "").trim();
  if (text.length > maxLength) throw new Error(`${field} must be ${maxLength} characters or fewer.`);
  return text || null;
}

function optionalDate(value, field = "date") {
  const date = String(value ?? "").trim();
  if (!date) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Enter a valid ${field}.`);
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    throw new Error("Enter a valid follow-up date.");
  }
  return date;
}

export function createOpportunity(input) {
  const name = String(input?.name ?? "").trim();
  const stage = String(input?.stage ?? "lead").toLowerCase();
  const rawAmount = input?.amount;
  const amount = rawAmount === "" || rawAmount === null || rawAmount === undefined ? null : Number(rawAmount);
  const currency = String(input?.currency ?? "USD").toUpperCase();
  const urgency = String(input?.urgency ?? "unknown").toLowerCase();
  const problemDuration = String(input?.problemDuration ?? "unknown").toLowerCase();

  if (!name || name.length > 80) throw new Error("Enter an opportunity name of 1–80 characters.");
  if (!OPPORTUNITY_STAGES.includes(stage)) throw new Error("Choose a valid pipeline stage.");
  if (amount !== null && (!Number.isFinite(amount) || amount <= 0)) throw new Error("Value must be a positive number or left blank if unknown.");
  if (!["USD", "SRD"].includes(currency)) throw new Error("Currency must be USD or SRD.");
  if (!URGENCY_LEVELS.includes(urgency)) throw new Error("Choose a valid urgency level.");
  if (!PROBLEM_DURATIONS.includes(problemDuration)) throw new Error("Choose a valid problem duration.");

  return {
    id: String(input?.id ?? createId()),
    name,
    stage,
    amount: amount === null ? null : Math.round(amount * 100) / 100,
    currency,
    organization: optionalText(input?.organization, "Organization", 160),
    contactName: optionalText(input?.contactName, "Contact name", 120),
    leadSource: optionalText(input?.leadSource, "Lead source", 160),
    problemStatement: optionalText(input?.problemStatement, "Problem statement"),
    currentProcess: optionalText(input?.currentProcess, "Current process"),
    businessImpact: optionalText(input?.businessImpact, "Business impact"),
    urgency,
    problemDuration,
    desiredOutcome: optionalText(input?.desiredOutcome, "Desired outcome"),
    receivedDate: optionalDate(input?.receivedDate, "received date"),
    nextFollowUp: optionalDate(input?.nextFollowUp, "follow-up date"),
    dataStatus: "user-entered"
  };
}

export function summarizePipeline(opportunities) {
  const records = Array.isArray(opportunities) ? opportunities : [];
  const totals = records.reduce((result, item) => {
    const currency = item.currency === "SRD" ? "SRD" : "USD";
    const value = item.amount === null || item.amount === undefined ? 0 : Number(item.amount);
    result[currency] += Number.isFinite(value) ? value : 0;
    return result;
  }, { USD: 0, SRD: 0 });

  return {
    count: records.length,
    totals: {
      USD: Math.round(totals.USD * 100) / 100,
      SRD: Math.round(totals.SRD * 100) / 100
    }
  };
}

export function formatMoney(amount, currency) {
  if (amount === null || amount === undefined || amount === "") return "Not estimated";
  const code = ["USD", "SRD"].includes(currency) ? currency : "USD";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `opp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
