import { createOpportunity, formatMoney, summarizePipeline } from "./domain.js";
import { supabase, supabaseConfigured } from "./supabase.js";
import { createUserOpportunity, deleteUserOpportunity, listOpportunities, updateUserOpportunity } from "./opportunities.js";

let opportunities = [];
let currentUser = null;
let authMode = "signin";
let editingOpportunity = null;
let editDialog = null;
const elements = {
  count: document.querySelector("#metric-count"), value: document.querySelector("#metric-value"), next: document.querySelector("#metric-next"),
  table: document.querySelector("#opportunity-rows"), recordCount: document.querySelector("#opportunity-count"), form: document.querySelector("#opportunity-form"),
  feedback: document.querySelector("#form-feedback"), today: document.querySelector("#today-label"), authPanel: document.querySelector("#auth-panel"),
  authForm: document.querySelector("#auth-form"), authFeedback: document.querySelector("#auth-feedback"), authMode: document.querySelector("#auth-mode"),
  authSubmit: document.querySelector("#auth-submit"), authUser: document.querySelector("#auth-user"), signOut: document.querySelector("#sign-out"),
  authHeading: document.querySelector("#auth-heading"), notice: document.querySelector("#workspace-notice")
};
const authenticatedContent = [...document.querySelectorAll(".authenticated-content")];
const stageLabels = { lead: "Lead", qualified: "Qualified", proposal: "Proposal", negotiation: "Negotiation" };
const urgencyLabels = { unknown: "Unknown", low: "Low", normal: "Normal", high: "High", critical: "Critical" };

function feedback(element, message, kind = "") {
  element.textContent = message;
  element.className = `form-feedback ${kind}`.trim();
}

function showUser(user) {
  currentUser = user;
  const signedIn = Boolean(user);
  elements.authPanel.hidden = signedIn || !supabaseConfigured;
  authenticatedContent.forEach(section => { section.hidden = !signedIn; });
  elements.signOut.hidden = !signedIn;
  elements.authUser.textContent = user?.email ?? "";
  if (!signedIn) {
    opportunities = [];
    render();
    return;
  }
  void refreshOpportunities();
}

async function refreshOpportunities() {
  try {
    opportunities = await listOpportunities(supabase);
    render();
  } catch (error) {
    feedback(elements.feedback, `Could not load opportunities: ${error.message}`, "error");
  }
}

function render() {
  const summary = summarizePipeline(opportunities);
  elements.count.textContent = String(summary.count);
  elements.value.textContent = `${formatMoney(summary.totals.USD, "USD")} USD · ${formatMoney(summary.totals.SRD, "SRD")} SRD`;
  elements.next.textContent = String(opportunities.filter(item => item.nextFollowUp).length);
  elements.recordCount.textContent = `${summary.count} record${summary.count === 1 ? "" : "s"}`;
  elements.table.replaceChildren();
  if (!opportunities.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
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
    const actions = document.createElement("td");
    const title = document.createElement("strong");
    title.textContent = item.name;
    name.append(title);
    if (item.organization) {
      const org = document.createElement("small");
      org.className = "row-subtext";
      org.textContent = item.organization;
      name.append(org);
    }
    if (item.problemStatement) {
      const problem = document.createElement("small");
      problem.className = "row-subtext";
      problem.textContent = item.problemStatement.length > 120 ? `${item.problemStatement.slice(0, 117)}…` : item.problemStatement;
      problem.title = item.problemStatement;
      name.append(problem);
    }
    const stageBadge = document.createElement("span");
    stageBadge.className = `stage stage-${item.stage}`;
    stageBadge.textContent = stageLabels[item.stage];
    stage.append(stageBadge);
    value.textContent = formatMoney(item.amount, item.currency);
    const dataTag = document.createElement("span");
    dataTag.className = item.problemStatement ? "data-tag data-user" : "data-tag";
    dataTag.textContent = item.problemStatement ? "Problem captured" : "Intake incomplete";
    status.append(dataTag);
    const edit = document.createElement("button");
    edit.type = "button"; edit.className = "row-action"; edit.textContent = "Edit";
    edit.addEventListener("click", () => void editOpportunity(item));
    const remove = document.createElement("button");
    remove.type = "button"; remove.className = "row-action danger"; remove.textContent = "Delete";
    remove.addEventListener("click", () => void removeOpportunity(item));
    actions.append(edit, remove);
    row.append(name, stage, value, status, actions);
    elements.table.append(row);
  }
}

function getEditDialog() {
  if (editDialog) return editDialog;
  editDialog = document.createElement("dialog");
  editDialog.className = "edit-dialog";
  editDialog.setAttribute("aria-labelledby", "edit-dialog-title");
  const panel = document.createElement("section");
  panel.className = "panel edit-dialog-panel";
  const heading = document.createElement("div");
  heading.className = "panel-heading";
  heading.innerHTML = '<div><p class="eyebrow">UPDATE RECORD</p><h2 id="edit-dialog-title">Edit opportunity</h2></div>';
  const form = elements.form.cloneNode(true);
  form.removeAttribute("id");
  form.querySelectorAll("[id]").forEach((element, index) => {
    const newId = `edit-${index}-${element.id}`;
    element.id = newId;
    if (element.tagName === "LABEL") element.htmlFor = newId;
  });
  form.querySelector('button[type="submit"]').textContent = "Save changes";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "secondary-button";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", () => editDialog.close());
  form.append(cancel);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!editingOpportunity) return;
    const data = new FormData(form);
    const changes = Object.fromEntries(data.entries());
    try {
      const valid = createOpportunity({ ...editingOpportunity, ...changes });
      const saved = await updateUserOpportunity(supabase, editingOpportunity.id, valid);
      opportunities = opportunities.map(record => record.id === editingOpportunity.id ? saved : record);
      editDialog.close();
      editingOpportunity = null;
      render();
      feedback(elements.feedback, "Opportunity intake updated.", "success");
    } catch (error) {
      feedback(form.querySelector(".form-feedback"), error.message, "error");
    }
  });
  panel.append(heading, form);
  editDialog.append(panel);
  editDialog.addEventListener("click", event => {
    if (event.target === editDialog) editDialog.close();
  });
  editDialog.addEventListener("close", () => { editingOpportunity = null; });
  document.body.append(editDialog);
  return editDialog;
}

function editOpportunity(item) {
  editingOpportunity = item;
  const dialog = getEditDialog();
  const form = dialog.querySelector("form");
  const values = {
    name: item.name, stage: item.stage, amount: item.amount ?? "", currency: item.currency,
    organization: item.organization ?? "", contactName: item.contactName ?? "",
    leadSource: item.leadSource ?? "", problemStatement: item.problemStatement ?? "",
    currentProcess: item.currentProcess ?? "", businessImpact: item.businessImpact ?? "",
    urgency: item.urgency, problemDuration: item.problemDuration,
    desiredOutcome: item.desiredOutcome ?? "", receivedDate: item.receivedDate ?? "",
    nextFollowUp: item.nextFollowUp ?? ""
  };
  for (const [name, value] of Object.entries(values)) {
    const control = form.elements.namedItem(name);
    if (control) control.value = value;
  }
  feedback(form.querySelector(".form-feedback"), "");
  dialog.showModal();
}

async function removeOpportunity(item) {
  if (!confirm(`Delete “${item.name}”?`)) return;
  try {
    await deleteUserOpportunity(supabase, item.id);
    opportunities = opportunities.filter(record => record.id !== item.id);
    render();
  } catch (error) { feedback(elements.feedback, error.message, "error"); }
}

elements.form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!currentUser) return;
  const formData = new FormData(elements.form);
  try {
    const opportunity = await createUserOpportunity(supabase, currentUser.id, {
      name: formData.get("name"), stage: formData.get("stage"), amount: formData.get("amount"), currency: formData.get("currency"),
      organization: formData.get("organization"), contactName: formData.get("contactName"), leadSource: formData.get("leadSource"),
      problemStatement: formData.get("problemStatement"), currentProcess: formData.get("currentProcess"),
      businessImpact: formData.get("businessImpact"), urgency: formData.get("urgency"),
      problemDuration: formData.get("problemDuration"), desiredOutcome: formData.get("desiredOutcome"),
      receivedDate: formData.get("receivedDate"), nextFollowUp: formData.get("nextFollowUp")
    });
    opportunities = [opportunity, ...opportunities];
    render(); elements.form.reset();
    feedback(elements.feedback, "Opportunity and intake details saved to your account.", "success");
  } catch (error) { feedback(elements.feedback, error.message, "error"); }
});

elements.authMode.addEventListener("click", () => {
  authMode = authMode === "signin" ? "signup" : "signin";
  const signup = authMode === "signup";
  elements.authHeading.textContent = signup ? "Create your account" : "Sign in to KairoSphere";
  elements.authSubmit.textContent = signup ? "Create account" : "Sign in";
  elements.authMode.textContent = signup ? "Back to sign in" : "Create account";
  document.querySelector("#auth-password").autocomplete = signup ? "new-password" : "current-password";
  feedback(elements.authFeedback, "");
});

elements.authForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!supabase) return;
  const data = new FormData(elements.authForm);
  const credentials = { email: data.get("email"), password: data.get("password") };
  elements.authSubmit.disabled = true;
  try {
    if (authMode === "signup") {
      const { data: result, error } = await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).href } });
      if (error) throw error;
      if (result.session) showUser(result.user);
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

elements.today.textContent = new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date());
if (!supabaseConfigured) {
  elements.authPanel.hidden = true;
  elements.notice.innerHTML = "<strong>Configuration required</strong><span>Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart the development server.</span>";
  feedback(elements.authFeedback, "Supabase environment variables are missing.", "error");
} else {
  supabase.auth.onAuthStateChange((_event, session) => showUser(session?.user ?? null));
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) feedback(elements.authFeedback, error.message, "error");
    showUser(data?.session?.user ?? null);
  });
}
render();
