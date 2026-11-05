import { createOpportunity, formatMoney, summarizePipeline } from "./domain.js";
import { supabase, supabaseConfigured } from "./supabase.js";
import { createUserOpportunity, deleteUserOpportunity, listOpportunities, updateUserOpportunity } from "./opportunities.js";
import {
  createOrganization, createProduct, createWarehouse, listInventoryBalances, listOpportunities as unused,
  listOrganizations, listProducts, listStockMovements, listWarehouses, recordStockMovement
} from "./inventory.js";
import { summarizeInventory } from "./inventory-domain.js";

let currentUser = null;
let authMode = "signin";
let organizations = [];
let activeOrganization = null;
let opportunities = [];
let warehouses = [];
let products = [];
let balances = [];
let movements = [];

const $ = selector => document.querySelector(selector);
const elements = {
  authPanel: $("#auth-panel"), authForm: $("#auth-form"), authFeedback: $("#auth-feedback"),
  authMode: $("#auth-mode"), authSubmit: $("#auth-submit"), authHeading: $("#auth-heading"),
  authUser: $("#auth-user"), signOut: $("#sign-out"), notice: $("#workspace-notice"),
  setup: $("#organization-setup"), setupForm: $("#organization-form"), setupFeedback: $("#organization-feedback"),
  workspace: $("#workspace-content"), organizationLabel: $("#organization-label"), organizationSelect: $("#organization-select"),
  today: $("#today-label"), warehouseForm: $("#warehouse-form"), warehouseFeedback: $("#warehouse-feedback"),
  productForm: $("#product-form"), productFeedback: $("#product-feedback"), movementForm: $("#movement-form"),
  movementFeedback: $("#movement-feedback"), balanceRows: $("#balance-rows"), balanceCount: $("#balance-count"),
  movementRows: $("#movement-rows"), inventorySkus: $("#inventory-skus"), inventoryWarehouses: $("#inventory-warehouses"),
  inventoryLow: $("#inventory-low"), inventoryStatus: $("#inventory-status"),
  warehouseSelect: $("#movement-warehouse"), productSelect: $("#movement-product"),
  opportunityForm: $("#opportunity-form"), opportunityFeedback: $("#form-feedback"),
  opportunityRows: $("#opportunity-rows"), opportunityCount: $("#opportunity-count"),
  pipelineCount: $("#metric-count"), pipelineValue: $("#metric-value"), pipelineNext: $("#metric-next")
};

function feedback(element, message, kind = "") {
  element.textContent = message;
  element.className = `form-feedback ${kind}`.trim();
}

function setView(view) {
  document.querySelectorAll(".view-tab").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  document.querySelectorAll(".view-panel").forEach(panel => { panel.hidden = panel.id !== `view-${view}`; });
}

async function showUser(user) {
  currentUser = user;
  const signedIn = Boolean(user);
  elements.authPanel.hidden = signedIn || !supabaseConfigured;
  elements.notice.hidden = signedIn;
  elements.setup.hidden = true;
  elements.workspace.hidden = true;
  elements.signOut.hidden = !signedIn;
  elements.authUser.textContent = user?.email ?? "";
  if (!signedIn) {
    organizations = []; activeOrganization = null; opportunities = []; warehouses = []; products = []; balances = []; movements = [];
    return;
  }
  await refreshWorkspace();
}

async function refreshWorkspace() {
  try {
    organizations = await listOrganizations(supabase);
    if (!organizations.length) {
      activeOrganization = null;
      elements.setup.hidden = false;
      elements.workspace.hidden = true;
      return;
    }
    if (!activeOrganization || !organizations.some(item => item.id === activeOrganization.id)) activeOrganization = organizations[0];
    elements.setup.hidden = true;
    elements.workspace.hidden = false;
    renderOrganizationSelector();
    await Promise.all([refreshInventory(), refreshOpportunities()]);
  } catch (error) {
    feedback(elements.setupFeedback, `Could not load your organization: ${error.message}`, "error");
    elements.setup.hidden = false;
  }
}

function renderOrganizationSelector() {
  elements.organizationLabel.textContent = activeOrganization.name;
  elements.organizationSelect.replaceChildren();
  for (const organization of organizations) {
    const option = document.createElement("option");
    option.value = organization.id;
    option.textContent = organization.name;
    option.selected = organization.id === activeOrganization.id;
    elements.organizationSelect.append(option);
  }
  elements.organizationSelect.hidden = organizations.length < 2;
}

async function refreshInventory() {
  const organizationId = activeOrganization.id;
  const results = await Promise.all([
    listWarehouses(supabase, organizationId),
    listProducts(supabase, organizationId),
    listInventoryBalances(supabase, organizationId),
    listStockMovements(supabase, organizationId)
  ]);
  [warehouses, products, balances, movements] = results;
  renderInventory();
}

function addCell(row, value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = value ?? "—";
  if (className) cell.className = className;
  row.append(cell);
  return cell;
}

function renderSelect(select, records, placeholder, label) {
  const previous = select.value;
  select.replaceChildren();
  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  select.append(first);
  for (const record of records) {
    const option = document.createElement("option");
    option.value = record.id;
    option.textContent = label(record);
    select.append(option);
  }
  if (records.some(record => record.id === previous)) select.value = previous;
}

function renderInventory() {
  const summary = summarizeInventory(balances);
  elements.inventorySkus.textContent = String(summary.skuCount);
  elements.inventoryWarehouses.textContent = String(warehouses.length);
  elements.inventoryLow.textContent = String(summary.lowStockCount);
  elements.inventoryStatus.textContent = `${products.length} products · ${movements.length} recent movements`;
  elements.balanceCount.textContent = `${balances.length} lines`;
  elements.warehouseSelect.disabled = !warehouses.length;
  elements.productSelect.disabled = !products.length;
  renderSelect(elements.warehouseSelect, warehouses, warehouses.length ? "Select warehouse" : "Add a warehouse first", item => `${item.code} · ${item.name}`);
  renderSelect(elements.productSelect, products, products.length ? "Select product" : "Add a product first", item => `${item.sku} · ${item.name}`);

  elements.balanceRows.replaceChildren();
  if (!balances.length) {
    const row = document.createElement("tr"); addCell(row, "No stock movements yet. Add a warehouse, product, then record an opening receipt.", "empty-state").colSpan = 6;
    elements.balanceRows.append(row);
  } else {
    for (const item of balances) {
      const row = document.createElement("tr");
      addCell(row, item.sku); addCell(row, item.product_name); addCell(row, `${item.warehouse_code} · ${item.warehouse_name}`);
      addCell(row, `${Number(item.quantity_on_hand).toLocaleString(undefined, { maximumFractionDigits: 3 })} ${item.unit}`);
      addCell(row, `${Number(item.reorder_point).toLocaleString(undefined, { maximumFractionDigits: 3 })} ${item.unit}`);
      const low = Number(item.quantity_on_hand) <= Number(item.reorder_point);
      const status = document.createElement("td"); const badge = document.createElement("span");
      badge.className = `data-tag ${low ? "data-low" : "data-user"}`; badge.textContent = low ? "Reorder" : "Available";
      status.append(badge); row.append(status); elements.balanceRows.append(row);
    }
  }

  elements.movementRows.replaceChildren();
  if (!movements.length) {
    const row = document.createElement("tr"); addCell(row, "No movement records yet.", "empty-state").colSpan = 5; elements.movementRows.append(row);
  } else {
    for (const item of movements) {
      const row = document.createElement("tr");
      addCell(row, new Date(item.created_at).toLocaleString());
      addCell(row, item.movement_type);
      const delta = Number(item.quantity_delta);
      addCell(row, `${delta > 0 ? "+" : ""}${delta.toLocaleString(undefined, { maximumFractionDigits: 3 })}`);
      addCell(row, item.reference || "—");
      addCell(row, item.notes || "—");
      elements.movementRows.append(row);
    }
  }
}

async function refreshOpportunities() {
  opportunities = await listOpportunities(supabase);
  renderOpportunities();
}

function renderOpportunities() {
  const summary = summarizePipeline(opportunities);
  elements.pipelineCount.textContent = String(summary.count);
  elements.pipelineValue.textContent = `${formatMoney(summary.totals.USD, "USD")} USD · ${formatMoney(summary.totals.SRD, "SRD")} SRD`;
  elements.pipelineNext.textContent = String(opportunities.filter(item => item.stage !== "negotiation").length);
  elements.opportunityCount.textContent = `${summary.count} record${summary.count === 1 ? "" : "s"}`;
  elements.opportunityRows.replaceChildren();
  if (!opportunities.length) {
    const row = document.createElement("tr"); addCell(row, "No opportunities yet. Add one to begin.", "empty-state").colSpan = 5;
    elements.opportunityRows.append(row); return;
  }
  const labels = { lead: "Lead", qualified: "Qualified", proposal: "Proposal", negotiation: "Negotiation" };
  for (const item of opportunities) {
    const row = document.createElement("tr");
    addCell(row, item.name);
    const stageCell = document.createElement("td"); const badge = document.createElement("span");
    badge.className = `stage stage-${item.stage}`; badge.textContent = labels[item.stage]; stageCell.append(badge); row.append(stageCell);
    addCell(row, formatMoney(item.amount, item.currency));
    const data = document.createElement("td"); const tag = document.createElement("span");
    tag.className = "data-tag data-user"; tag.textContent = "Private"; data.append(tag); row.append(data);
    const actions = document.createElement("td");
    const edit = document.createElement("button"); edit.type = "button"; edit.className = "row-action"; edit.textContent = "Edit";
    edit.addEventListener("click", () => void editOpportunity(item));
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "row-action danger"; remove.textContent = "Delete";
    remove.addEventListener("click", () => void removeOpportunity(item));
    actions.append(edit, remove); row.append(actions); elements.opportunityRows.append(row);
  }
}

async function editOpportunity(item) {
  const name = prompt("Opportunity name", item.name); if (name === null) return;
  const stage = prompt("Stage (lead, qualified, proposal, negotiation)", item.stage); if (stage === null) return;
  const amount = prompt("Estimated value", String(item.amount)); if (amount === null) return;
  const currency = prompt("Currency (USD or SRD)", item.currency); if (currency === null) return;
  try {
    const valid = createOpportunity({ ...item, name, stage, amount, currency });
    const saved = await updateUserOpportunity(supabase, item.id, valid);
    opportunities = opportunities.map(record => record.id === item.id ? saved : record);
    renderOpportunities();
  } catch (error) { feedback(elements.opportunityFeedback, error.message, "error"); }
}

async function removeOpportunity(item) {
  if (!confirm(`Delete “${item.name}”?`)) return;
  try {
    await deleteUserOpportunity(supabase, item.id);
    opportunities = opportunities.filter(record => record.id !== item.id);
    renderOpportunities();
  } catch (error) { feedback(elements.opportunityFeedback, error.message, "error"); }
}

elements.setupForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!currentUser) return;
  const data = new FormData(elements.setupForm);
  const submit = elements.setupForm.querySelector("button[type=submit]"); submit.disabled = true;
  try {
    activeOrganization = await createOrganization(supabase, currentUser.id, data.get("name"));
    elements.setupForm.reset();
    await refreshWorkspace();
    setView("inventory");
  } catch (error) { feedback(elements.setupFeedback, error.message, "error"); }
  finally { submit.disabled = false; }
});

elements.organizationSelect.addEventListener("change", async () => {
  activeOrganization = organizations.find(item => item.id === elements.organizationSelect.value) ?? activeOrganization;
  renderOrganizationSelector();
  try { await Promise.all([refreshInventory(), refreshOpportunities()]); }
  catch (error) { feedback(elements.movementFeedback, error.message, "error"); }
});

elements.warehouseForm.addEventListener("submit", async event => {
  event.preventDefault();
  const data = new FormData(elements.warehouseForm);
  const submit = elements.warehouseForm.querySelector("button[type=submit]"); submit.disabled = true;
  try {
    await createWarehouse(supabase, activeOrganization.id, Object.fromEntries(data));
    elements.warehouseForm.reset(); await refreshInventory();
    feedback(elements.warehouseFeedback, "Warehouse saved.", "success");
  } catch (error) { feedback(elements.warehouseFeedback, error.message, "error"); }
  finally { submit.disabled = false; }
});

elements.productForm.addEventListener("submit", async event => {
  event.preventDefault();
  const data = new FormData(elements.productForm);
  const submit = elements.productForm.querySelector("button[type=submit]"); submit.disabled = true;
  try {
    await createProduct(supabase, activeOrganization.id, Object.fromEntries(data));
    elements.productForm.reset(); $("#product-unit").value = "each"; $("#product-reorder").value = "0"; $("#product-cost").value = "0";
    await refreshInventory(); feedback(elements.productFeedback, "Product saved to the company catalogue.", "success");
  } catch (error) { feedback(elements.productFeedback, error.message, "error"); }
  finally { submit.disabled = false; }
});

elements.movementForm.addEventListener("submit", async event => {
  event.preventDefault();
  const data = new FormData(elements.movementForm);
  const submit = elements.movementForm.querySelector("button[type=submit]"); submit.disabled = true;
  try {
    await recordStockMovement(supabase, currentUser.id, activeOrganization.id, Object.fromEntries(data));
    elements.movementForm.reset(); await refreshInventory();
    feedback(elements.movementFeedback, "Stock movement posted to the audit ledger.", "success");
  } catch (error) { feedback(elements.movementFeedback, error.message, "error"); }
  finally { submit.disabled = false; }
});

elements.opportunityForm.addEventListener("submit", async event => {
  event.preventDefault(); if (!currentUser) return;
  const data = new FormData(elements.opportunityForm);
  const submit = elements.opportunityForm.querySelector("button[type=submit]"); submit.disabled = true;
  try {
    const opportunity = await createUserOpportunity(supabase, currentUser.id, {
      name: data.get("name"), stage: data.get("stage"), amount: data.get("amount"), currency: data.get("currency")
    });
    opportunities = [opportunity, ...opportunities]; renderOpportunities(); elements.opportunityForm.reset();
    feedback(elements.opportunityFeedback, "Opportunity saved to your private pipeline.", "success");
  } catch (error) { feedback(elements.opportunityFeedback, error.message, "error"); }
  finally { submit.disabled = false; }
});

document.querySelectorAll(".view-tab").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));

elements.authMode.addEventListener("click", () => {
  authMode = authMode === "signin" ? "signup" : "signin";
  const signup = authMode === "signup";
  elements.authHeading.textContent = signup ? "Create your account" : "Sign in to KairoSphere";
  elements.authSubmit.textContent = signup ? "Create account" : "Sign in";
  elements.authMode.textContent = signup ? "Back to sign in" : "Create account";
  $("#auth-password").autocomplete = signup ? "new-password" : "current-password";
  feedback(elements.authFeedback, "");
});

elements.authForm.addEventListener("submit", async event => {
  event.preventDefault(); if (!supabase) return;
  const data = new FormData(elements.authForm);
  const credentials = { email: data.get("email"), password: data.get("password") };
  elements.authSubmit.disabled = true;
  try {
    if (authMode === "signup") {
      const { data: result, error } = await supabase.auth.signUp({
        ...credentials, options: { emailRedirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).href }
      });
      if (error) throw error;
      if (result.session) await showUser(result.user);
      else feedback(elements.authFeedback, "Check your email to verify your account, then sign in.", "success");
    } else {
      const { error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
    }
  } catch (error) { feedback(elements.authFeedback, error.message, "error"); }
  finally { elements.authSubmit.disabled = false; }
});

elements.signOut.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) feedback(elements.authFeedback, error.message, "error");
});

document.querySelectorAll(".view-tab").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
elements.today.textContent = new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date());

if (!supabaseConfigured) {
  elements.authPanel.hidden = true;
  elements.notice.innerHTML = "<strong>Configuration required</strong><span>Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart the development server.</span>";
  feedback(elements.authFeedback, "Supabase environment variables are missing.", "error");
} else {
  supabase.auth.onAuthStateChange((_event, session) => { void showUser(session?.user ?? null); });
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) feedback(elements.authFeedback, error.message, "error");
    void showUser(data?.session?.user ?? null);
  });
}
setView("inventory");
