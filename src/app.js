import { createOpportunity, formatMoney, summarizePipeline } from "./domain.js";

const sampleOpportunities = [
  { id: "sample-1", name: "Industrial pump sourcing", stage: "qualified", amount: 4800, currency: "USD", dataStatus: "illustrative" },
  { id: "sample-2", name: "Warehouse equipment supply", stage: "proposal", amount: 125000, currency: "SRD", dataStatus: "illustrative" },
  { id: "sample-3", name: "Spare parts procurement", stage: "lead", amount: 2150, currency: "USD", dataStatus: "illustrative" }
];

let opportunities = [...sampleOpportunities];

const elements = {
  count: document.querySelector("#metric-count"),
  value: document.querySelector("#metric-value"),
  next: document.querySelector("#metric-next"),
  table: document.querySelector("#opportunity-rows"),
  recordCount: document.querySelector("#opportunity-count"),
  form: document.querySelector("#opportunity-form"),
  feedback: document.querySelector("#form-feedback"),
  today: document.querySelector("#today-label")
};

const stageLabels = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation"
};

function render() {
  const summary = summarizePipeline(opportunities);
  elements.count.textContent = String(summary.count);
  elements.value.textContent = `${formatMoney(summary.totals.USD, "USD")} USD · ${formatMoney(summary.totals.SRD, "SRD")} SRD`;
  elements.next.textContent = String(opportunities.filter(item => item.stage !== "negotiation").length);
  elements.recordCount.textContent = `${summary.count} record${summary.count === 1 ? "" : "s"}`;

  elements.table.replaceChildren();
  if (!opportunities.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "empty-state";
    cell.textContent = "No opportunities yet. Add one to begin.";
    row.append(cell);
    elements.table.append(row);
    return;
  }

  for (const item of opportunities) {
    const row = document.createElement("tr");
    const name = document.createElement("td");
    const stage = document.createElement("td");
    const value = document.createElement("td");
    const status = document.createElement("td");
    name.textContent = item.name;
    stage.innerHTML = `<span class="stage stage-${item.stage}">${stageLabels[item.stage]}</span>`;
    value.textContent = formatMoney(item.amount, item.currency);
    status.innerHTML = item.dataStatus === "illustrative"
      ? '<span class="data-tag">Sample</span>'
      : '<span class="data-tag data-user">Session</span>';
    row.append(name, stage, value, status);
    elements.table.append(row);
  }
}

elements.form.addEventListener("submit", event => {
  event.preventDefault();
  const formData = new FormData(elements.form);
  try {
    const opportunity = createOpportunity({
      name: formData.get("name"),
      stage: formData.get("stage"),
      amount: formData.get("amount"),
      currency: formData.get("currency")
    });
    opportunities = [opportunity, ...opportunities];
    render();
    elements.form.reset();
    elements.feedback.textContent = "Opportunity added for this session.";
    elements.feedback.className = "form-feedback success";
  } catch (error) {
    elements.feedback.textContent = error.message;
    elements.feedback.className = "form-feedback error";
  }
});

elements.today.textContent = new Intl.DateTimeFormat("en", {
  weekday: "short", day: "numeric", month: "short", year: "numeric"
}).format(new Date());

render();
