export const OPPORTUNITY_STAGES = Object.freeze(["lead", "qualified", "proposal", "negotiation"]);

export function createOpportunity(input) {
  const name = String(input?.name ?? "").trim();
  const stage = String(input?.stage ?? "lead").toLowerCase();
  const amount = Number(input?.amount);
  const currency = String(input?.currency ?? "USD").toUpperCase();
  if (!name || name.length > 80) throw new Error("Enter an opportunity name of 1–80 characters.");
  if (!OPPORTUNITY_STAGES.includes(stage)) throw new Error("Choose a valid pipeline stage.");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Value must be a positive number.");
  if (!["USD", "SRD"].includes(currency)) throw new Error("Currency must be USD or SRD.");
  return {
    id: String(input?.id ?? createId()), name, stage,
    amount: Math.round(amount * 100) / 100, currency, dataStatus: "user-entered"
  };
}
export function summarizePipeline(opportunities) {
  const records = Array.isArray(opportunities) ? opportunities : [];
  const totals = records.reduce((result, item) => {
    const currency = item.currency === "SRD" ? "SRD" : "USD";
    result[currency] += Number.isFinite(Number(item.amount)) ? Number(item.amount) : 0;
    return result;
  }, { USD: 0, SRD: 0 });
  return { count: records.length, totals: {
    USD: Math.round(totals.USD * 100) / 100, SRD: Math.round(totals.SRD * 100) / 100
  }};
}
export function formatMoney(amount, currency) {
  const code = ["USD", "SRD"].includes(currency) ? currency : "USD";
  return new Intl.NumberFormat("en", { style: "currency", currency: code, maximumFractionDigits: 2 }).format(Number(amount) || 0);
}
function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `opp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
