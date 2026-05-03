import {
  getStudents,
  saveStudents,
  getDraft,
  saveDraft,
  clearDraft,
  getFilters,
  saveFilters,
  clearFilters,
} from "./storage.js";
import { showFeedback } from "./ui.js";
import { DOM, STATE, DEFAULT_FILTERS, getMetricNodes, getModalNodes } from "./app-state.js";
import { createStudentsMapController } from "./students-map.js";
import { createLocationMapController } from "./location-map.js";
import { createConfirmationController } from "./confirmation-modal.js";
import { createStudentModalController } from "./student-modal.js";
import { createMetricsController } from "./metrics-controller.js";
import { createAppView } from "./app-view.js";
import { createStudentActions } from "./student-actions.js";

const studentsMap = createStudentsMapController(DOM);
const locationMap = createLocationMapController({
  dom: DOM,
  persistDraftFromForm,
  notify,
});
const confirmation = createConfirmationController({
  dom: DOM,
  notify,
});
const studentModal = createStudentModalController({
  dom: DOM,
  state: STATE,
  getModalNodes,
  getDraft,
  locationMap,
  persistDraftFromForm,
});
const metrics = createMetricsController({
  dom: DOM,
  getMetricNodes,
  workerUrl: new URL("./workers/student-metrics.worker.js", import.meta.url),
  notify,
});
const view = createAppView({
  dom: DOM,
  state: STATE,
  getDraft,
  studentsMap,
  metrics,
  notify,
});
const actions = createStudentActions({
  dom: DOM,
  state: STATE,
  getDraft,
  saveStudents,
  clearDraft,
  clearFilters,
  defaultFilters: DEFAULT_FILTERS,
  studentModal,
  confirmation,
  view,
  notify,
});

function init() {
  STATE.students = getStudents();
  STATE.filters = { ...DEFAULT_FILTERS, ...getFilters() };

  view.hydrateFilterInputs();
  bindEvents();
  confirmation.bindEvents();
  studentModal.bindEvents({ onSubmit: actions.saveStudentFromForm });
  metrics.setup();
  studentsMap.init();
  view.renderApplication();
}

function bindEvents() {
  DOM.newStudentButton?.addEventListener("click", () => studentModal.openCreate());
  DOM.demoButton?.addEventListener("click", () => actions.loadDemoStudents());
  DOM.clearAllButton?.addEventListener("click", () => actions.clearAllStudents());
  DOM.resetFiltersButton?.addEventListener("click", resetFiltersView);
  DOM.searchInput?.addEventListener("input", (event) => updateFilter("search", event.target.value));
  DOM.careerFilter?.addEventListener("change", (event) => updateFilter("career", event.target.value));
  DOM.statusFilter?.addEventListener("change", (event) => updateFilter("status", event.target.value));
  DOM.studentTableBody?.addEventListener("click", handleTableAction);
  DOM.locationButton?.addEventListener("click", async () => {
    await locationMap.resolveCurrentLocation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (confirmation.handleEscape()) {
      return;
    }

    studentModal.handleEscape();
  });
}

function handleTableAction(event) {
  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  const { action, id } = button.dataset;

  if (action === "edit") {
    openStudentForEdit(id);
  }

  if (action === "delete") {
    actions.deleteStudent(id);
  }
}

function openStudentForEdit(studentId) {
  const student = STATE.students.find((candidate) => candidate.id === studentId);

  if (!student) {
    notify("error", "Registro no encontrado", "No fue posible cargar el estudiante.");
    return;
  }

  studentModal.openEdit(student);
}

function updateFilter(fieldName, value) {
  STATE.filters[fieldName] = value;
  persistFilters();
  view.renderApplication();
}

function resetFiltersView() {
  STATE.filters = { ...DEFAULT_FILTERS };
  persistFilters();
  view.hydrateFilterInputs();
  view.renderApplication();
  notify("success", "Filtros reiniciados", "Se limpio la vista filtrada.");
}

function persistDraftFromForm() {
  if (DOM.studentModal.hidden) {
    return;
  }

  saveDraft({
    mode: STATE.editingId ? "edit" : "create",
    studentId: STATE.editingId,
    values: studentModal.readForm(),
  });
  view.renderStorageMeta();
}

function persistFilters() {
  saveFilters(STATE.filters);
  view.renderStorageMeta();
}

function notify(tone, title, message) {
  showFeedback(DOM.feedbackContainer, {
    tone,
    title,
    message,
  });
}

init();
