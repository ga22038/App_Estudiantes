export const DEFAULT_FILTERS = {
  search: "",
  career: "",
  status: "",
};

export const DOM = {
  feedbackContainer: document.querySelector("#feedbackContainer"),
  storageStatus: document.querySelector("#storageStatus"),
  draftIndicator: document.querySelector("#draftIndicator"),
  newStudentButton: document.querySelector("#newStudentButton"),
  demoButton: document.querySelector("#demoButton"),
  clearAllButton: document.querySelector("#clearAllButton"),
  resetFiltersButton: document.querySelector("#resetFiltersButton"),
  searchInput: document.querySelector("#searchInput"),
  careerFilter: document.querySelector("#careerFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  resultsSummary: document.querySelector("#resultsSummary"),
  studentTableBody: document.querySelector("#studentTableBody"),
  careerBreakdown: document.querySelector("#careerBreakdown"),
  latestLocationCard: document.querySelector("#latestLocationCard"),
  studentModal: document.querySelector("#studentModal"),
  closeModalButton: document.querySelector("#closeModalButton"),
  cancelModalButton: document.querySelector("#cancelModalButton"),
  studentForm: document.querySelector("#studentForm"),
  modalModeBadge: document.querySelector("#modalModeBadge"),
  modalTitle: document.querySelector("#modalTitle"),
  submitButton: document.querySelector("#submitButton"),
  formStatusText: document.querySelector("#formStatusText"),
  locationButton: document.querySelector("#locationButton"),
  locationStatus: document.querySelector("#locationStatus"),
  metricTotal: document.querySelector("#metricTotal"),
  metricActive: document.querySelector("#metricActive"),
  metricInactive: document.querySelector("#metricInactive"),
  metricAverage: document.querySelector("#metricAverage"),
  metricAdults: document.querySelector("#metricAdults"),
  metricLocated: document.querySelector("#metricLocated"),
  studentsMap: document.querySelector("#studentsMap"),
  mapStudentCount: document.querySelector("#mapStudentCount"),
  studentsMapEmpty: document.querySelector("#studentsMapEmpty"),
  confirmModal: document.querySelector("#confirmModal"),
  confirmTitle: document.querySelector("#confirmTitle"),
  confirmMessage: document.querySelector("#confirmMessage"),
  confirmIcon: document.querySelector("#confirmIcon"),
  confirmOkButton: document.querySelector("#confirmOkButton"),
  confirmCancelButton: document.querySelector("#confirmCancelButton"),
};

export const STATE = {
  students: [],
  filteredStudents: [],
  filters: { ...DEFAULT_FILTERS },
  editingId: null,
};

export function getMetricNodes() {
  return {
    total: DOM.metricTotal,
    active: DOM.metricActive,
    inactive: DOM.metricInactive,
    average: DOM.metricAverage,
    adults: DOM.metricAdults,
    located: DOM.metricLocated,
  };
}

export function getModalNodes() {
  return {
    modeBadge: DOM.modalModeBadge,
    title: DOM.modalTitle,
    submitButton: DOM.submitButton,
  };
}
