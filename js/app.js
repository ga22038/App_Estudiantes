import {
  STORAGE_KEYS,
  getStudents,
  saveStudents,
  getDraft,
  saveDraft,
  clearDraft,
  getFilters,
  saveFilters,
  clearFilters,
} from "./storage.js";
import { normalizeStudent, validateStudent } from "./validation.js";
import {
  renderStudentTable,
  renderMetrics,
  renderCareerBreakdown,
  renderResultsSummary,
  renderLatestLocation,
  populateForm,
  resetForm,
  clearFormErrors,
  renderFormErrors,
  toggleModal,
  renderModalMeta,
  renderLocationStatus,
  showFeedback,
  renderStorageStatus,
  renderCareerOptions,
} from "./ui.js";
import { requestCurrentCoordinates, reverseGeocodeCoordinates } from "./api.js";

const DEFAULT_FILTERS = {
  search: "",
  career: "",
  status: "",
};

const DOM = {
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
};

const STATE = {
  students: [],
  filteredStudents: [],
  filters: { ...DEFAULT_FILTERS },
  editingId: null,
  worker: null,
};

/**
 * Punto de entrada principal de la aplicacion.
 */
function init() {
  STATE.students = getStudents();
  STATE.filters = { ...DEFAULT_FILTERS, ...getFilters() };

  hydrateFilterInputs();
  bindEvents();
  setupWorker();
  renderApplication();
}

/**
 * Registra todos los listeners del DOM.
 */
function bindEvents() {
  DOM.newStudentButton?.addEventListener("click", () => {
    openCreateModal();
  });

  DOM.demoButton?.addEventListener("click", () => {
    loadDemoStudents();
  });

  DOM.clearAllButton?.addEventListener("click", () => {
    clearAllStudents();
  });

  DOM.resetFiltersButton?.addEventListener("click", () => {
    STATE.filters = { ...DEFAULT_FILTERS };
    persistFilters();
    hydrateFilterInputs();
    renderApplication();
    notify("success", "Filtros reiniciados", "Se limpio la vista filtrada.");
  });

  DOM.searchInput?.addEventListener("input", (event) => {
    STATE.filters.search = event.target.value;
    persistFilters();
    renderApplication();
  });

  DOM.careerFilter?.addEventListener("change", (event) => {
    STATE.filters.career = event.target.value;
    persistFilters();
    renderApplication();
  });

  DOM.statusFilter?.addEventListener("change", (event) => {
    STATE.filters.status = event.target.value;
    persistFilters();
    renderApplication();
  });

  DOM.studentTableBody?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    const { action, id } = button.dataset;

    if (action === "edit") {
      openEditModal(id);
    }

    if (action === "delete") {
      deleteStudent(id);
    }
  });

  DOM.closeModalButton?.addEventListener("click", closeModal);
  DOM.cancelModalButton?.addEventListener("click", closeModal);

  DOM.studentModal?.addEventListener("click", (event) => {
    if (event.target === DOM.studentModal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !DOM.studentModal.hidden) {
      closeModal();
    }
  });

  DOM.studentForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveStudentFromForm();
  });

  DOM.studentForm?.addEventListener("input", () => {
    clearFormErrors(DOM.studentForm);
    persistDraftFromForm();
  });

  DOM.studentForm?.addEventListener("change", () => {
    persistDraftFromForm();
  });

  DOM.locationButton?.addEventListener("click", async () => {
    await resolveLocationForForm();
  });
}

/**
 * Configura el worker que calcula metricas del dashboard.
 */
function setupWorker() {
  try {
    STATE.worker = new Worker(new URL("./workers/student-metrics.worker.js", import.meta.url));
    STATE.worker.onmessage = (event) => {
      renderMetrics(
        {
          total: DOM.metricTotal,
          active: DOM.metricActive,
          inactive: DOM.metricInactive,
          average: DOM.metricAverage,
          adults: DOM.metricAdults,
          located: DOM.metricLocated,
        },
        event.data
      );
      renderCareerBreakdown(DOM.careerBreakdown, event.data.porCarrera ?? {});
    };
  } catch (error) {
    console.error("No fue posible iniciar el Web Worker.", error);
    STATE.worker = null;
    notify(
      "warning",
      "Worker no disponible",
      "Las metricas se calcularan en el hilo principal como respaldo."
    );
  }
}

/**
 * Renderiza todos los bloques reactivos de la aplicacion.
 */
function renderApplication() {
  try {
    STATE.filteredStudents = applyFilters(STATE.students, STATE.filters);

    renderCareerOptions(
      DOM.careerFilter,
      STATE.students.map((student) => student.carrera),
      STATE.filters.career
    );
    renderStudentTable(DOM.studentTableBody, STATE.filteredStudents);
    renderResultsSummary(
      DOM.resultsSummary,
      STATE.filteredStudents.length,
      STATE.students.length
    );
    renderStorageMeta();
    renderLatestLocation(
      DOM.latestLocationCard,
      findLatestLocatedStudent(STATE.students)
    );
    updateMetrics(STATE.filteredStudents);
  } catch (error) {
    console.error("Error al renderizar la aplicacion.", error);
    notify(
      "error",
      "Error de interfaz",
      "No fue posible actualizar la vista. Revisa la consola del navegador."
    );
  }
}

/**
 * Aplica busqueda y filtros de carrera o estado sobre los estudiantes.
 *
 * @param {Array<object>} students
 * @param {{ search: string, career: string, status: string }} filters
 * @returns {Array<object>}
 */
function applyFilters(students, filters) {
  const searchTerm = String(filters.search ?? "").trim().toLowerCase();

  return students.filter((student) => {
    const matchesSearch =
      !searchTerm ||
      [
        student.carnet,
        student.nombres,
        student.apellidos,
        `${student.nombres} ${student.apellidos}`,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);

    const matchesCareer =
      !filters.career || String(student.carrera) === String(filters.career);
    const matchesStatus =
      !filters.status || String(student.estado) === String(filters.status);

    return matchesSearch && matchesCareer && matchesStatus;
  });
}

/**
 * Carga los filtros guardados de sessionStorage en los controles visibles.
 */
function hydrateFilterInputs() {
  DOM.searchInput.value = STATE.filters.search;
  DOM.statusFilter.value = STATE.filters.status;
}

/**
 * Abre el modal en modo creacion, usando borrador si existe.
 */
function openCreateModal() {
  STATE.editingId = null;
  resetForm(DOM.studentForm);
  renderModalMeta(getModalNodes(), false);
  renderLocationStatus(
    DOM.locationStatus,
    "La ubicacion es opcional y no bloquea el guardado."
  );

  const draft = getDraft();

  if (draft.mode === "create" && draft.values) {
    populateForm(DOM.studentForm, draft.values);
    DOM.formStatusText.textContent =
      "Se recupero el borrador guardado en la sesion actual.";
  } else {
    DOM.formStatusText.textContent =
      "El formulario guarda borrador en sessionStorage.";
  }

  toggleModal(DOM.studentModal, true);
  DOM.studentForm.elements.namedItem("carnet")?.focus();
}

/**
 * Abre el modal en modo edicion.
 *
 * @param {string} studentId
 */
function openEditModal(studentId) {
  const student = STATE.students.find((candidate) => candidate.id === studentId);

  if (!student) {
    notify("error", "Registro no encontrado", "No fue posible cargar el estudiante.");
    return;
  }

  STATE.editingId = studentId;
  resetForm(DOM.studentForm);
  renderModalMeta(getModalNodes(), true);

  const draft = getDraft();
  if (draft.mode === "edit" && draft.studentId === studentId && draft.values) {
    populateForm(DOM.studentForm, draft.values);
    DOM.formStatusText.textContent =
      "Se recupero un borrador de edicion pendiente de la sesion.";
  } else {
    populateForm(DOM.studentForm, student);
    DOM.formStatusText.textContent =
      "Edita los datos y guarda los cambios para actualizar el registro.";
  }

  renderLocationStatus(
    DOM.locationStatus,
    student.ubicacionTexto
      ? "Puedes recapturar la ubicacion si deseas actualizarla."
      : "Este estudiante aun no tiene una ubicacion capturada."
  );

  toggleModal(DOM.studentModal, true);
  DOM.studentForm.elements.namedItem("carnet")?.focus();
}

/**
 * Cierra el modal y limpia solo el estado visual temporal.
 */
function closeModal() {
  toggleModal(DOM.studentModal, false);
  clearFormErrors(DOM.studentForm);
}

/**
 * Guarda un estudiante nuevo o actualiza el actual.
 */
function saveStudentFromForm() {
  try {
    const rawStudent = readStudentForm();
    const normalizedStudent = normalizeStudent(rawStudent);
    const validation = validateStudent(
      normalizedStudent,
      STATE.students,
      STATE.editingId
    );

    if (!validation.isValid) {
      clearFormErrors(DOM.studentForm);
      renderFormErrors(DOM.studentForm, validation.errors);
      notify(
        "warning",
        "Formulario incompleto",
        "Corrige los campos marcados antes de guardar."
      );
      return;
    }

    const existingStudent = STATE.students.find(
      (candidate) => candidate.id === STATE.editingId
    );

    const studentToSave = {
      ...(existingStudent ?? {}),
      ...normalizedStudent,
      id: existingStudent?.id ?? createStudentId(),
      fechaRegistro: existingStudent?.fechaRegistro ?? new Date().toISOString(),
    };

    const nextStudents = existingStudent
      ? STATE.students.map((student) =>
          student.id === existingStudent.id ? studentToSave : student
        )
      : [studentToSave, ...STATE.students];

    if (!saveStudents(nextStudents)) {
      throw new Error("No se pudo guardar la informacion en localStorage.");
    }

    STATE.students = sortStudents(nextStudents);
    clearDraft();
    STATE.editingId = null;
    resetForm(DOM.studentForm);
    closeModal();
    renderApplication();

    notify(
      "success",
      existingStudent ? "Registro actualizado" : "Registro creado",
      existingStudent
        ? "El estudiante fue actualizado correctamente."
        : "El estudiante fue agregado correctamente."
    );
  } catch (error) {
    console.error("Error al guardar el estudiante.", error);
    notify(
      "error",
      "No fue posible guardar",
      "Ocurrio un problema al intentar persistir el estudiante."
    );
  }
}

/**
 * Elimina un estudiante previa confirmacion.
 *
 * @param {string} studentId
 */
function deleteStudent(studentId) {
  const student = STATE.students.find((candidate) => candidate.id === studentId);

  if (!student) {
    notify("error", "Registro no encontrado", "No fue posible eliminar el estudiante.");
    return;
  }

  const confirmed = window.confirm(
    `Se eliminara a ${student.nombres} ${student.apellidos}. Deseas continuar?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const nextStudents = STATE.students.filter((candidate) => candidate.id !== studentId);

    if (!saveStudents(nextStudents)) {
      throw new Error("No se pudo actualizar localStorage despues de eliminar.");
    }

    STATE.students = nextStudents;

    const draft = getDraft();
    if (draft.studentId === studentId) {
      clearDraft();
    }

    renderApplication();
    notify("success", "Registro eliminado", "El estudiante fue retirado del listado.");
  } catch (error) {
    console.error("Error al eliminar el estudiante.", error);
    notify(
      "error",
      "No fue posible eliminar",
      "Ocurrio un problema al intentar borrar el estudiante."
    );
  }
}

/**
 * Carga datos de ejemplo utiles para una demo rapida del proyecto.
 */
function loadDemoStudents() {
  const shouldAppend = window.confirm(
    STATE.students.length
      ? "Ya hay registros guardados. Deseas agregar datos de ejemplo sin borrar lo actual?"
      : "Se cargaran estudiantes de ejemplo para la demostracion. Continuar?"
  );

  if (!shouldAppend) {
    return;
  }

  const demoCatalog = [
    {
      id: createStudentId(),
      carnet: "UES-2026-001",
      nombres: "Daniela",
      apellidos: "Rivas",
      edad: 21,
      telefono: "7001-2003",
      direccion: "Colonia El Triunfo, Santa Ana",
      encargado: "Maria Rivas",
      correoInstitucional: "daniela.rivas@ues.edu.sv",
      carrera: "Ingenieria en Desarrollo de Software",
      ciclo: "06",
      promedio: 8.74,
      estado: "Activo",
      fechaRegistro: new Date(Date.now() - 86_400_000).toISOString(),
      latitud: 13.99417,
      longitud: -89.55972,
      ubicacionTexto: "Santa Ana, Santa Ana, El Salvador",
    },
    {
      id: createStudentId(),
      carnet: "UES-2026-002",
      nombres: "Luis",
      apellidos: "Mendez",
      edad: 18,
      telefono: "7110-4412",
      direccion: "Barrio San Sebastian, Sonsonate",
      encargado: "Carlos Mendez",
      correoInstitucional: "luis.mendez@ues.edu.sv",
      carrera: "Arquitectura",
      ciclo: "03",
      promedio: 7.92,
      estado: "Becado",
      fechaRegistro: new Date(Date.now() - 43_200_000).toISOString(),
      latitud: null,
      longitud: null,
      ubicacionTexto: "Sonsonate, El Salvador",
    },
    {
      id: createStudentId(),
      carnet: "UES-2026-003",
      nombres: "Andrea",
      apellidos: "Gonzalez",
      edad: 24,
      telefono: "7288-0041",
      direccion: "Residencial Nueva Esperanza, Ahuachapan",
      encargado: "Rosa Gonzalez",
      correoInstitucional: "andrea.gonzalez@ues.edu.sv",
      carrera: "Administracion de Empresas",
      ciclo: "08",
      promedio: 9.12,
      estado: "Egresado",
      fechaRegistro: new Date().toISOString(),
      latitud: 13.92139,
      longitud: -89.845,
      ubicacionTexto: "Ahuachapan, El Salvador",
    },
  ];

  const mergedByCarnet = new Map(
    STATE.students.map((student) => [String(student.carnet).toUpperCase(), student])
  );

  demoCatalog.forEach((student) => {
    mergedByCarnet.set(String(student.carnet).toUpperCase(), student);
  });

  const demoStudents = sortStudents([...mergedByCarnet.values()]);

  if (!saveStudents(demoStudents)) {
    notify(
      "error",
      "No fue posible cargar la demo",
      "No se pudo persistir la informacion de ejemplo."
    );
    return;
  }

  STATE.students = demoStudents;
  renderApplication();
  notify(
    "success",
    "Datos de ejemplo listos",
    "La tabla fue poblada con estudiantes para tu presentacion."
  );
}

/**
 * Elimina todos los estudiantes y reinicia la interfaz.
 */
function clearAllStudents() {
  const confirmed = window.confirm(
    "Se eliminaran todos los registros del localStorage. Deseas continuar?"
  );

  if (!confirmed) {
    return;
  }

  try {
    if (!saveStudents([])) {
      throw new Error("No se pudo vaciar localStorage.");
    }

    STATE.students = [];
    STATE.filteredStudents = [];
    clearDraft();
    clearFilters();
    STATE.filters = { ...DEFAULT_FILTERS };
    hydrateFilterInputs();
    renderApplication();

    notify(
      "success",
      "Registros eliminados",
      "La aplicacion volvio al estado inicial."
    );
  } catch (error) {
    console.error("Error al limpiar los registros.", error);
    notify(
      "error",
      "No fue posible limpiar",
      "Ocurrio un problema al reiniciar los datos guardados."
    );
  }
}

/**
 * Captura geolocalizacion, llama a fetch y actualiza el formulario.
 */
async function resolveLocationForForm() {
  DOM.locationButton.disabled = true;
  renderLocationStatus(
    DOM.locationStatus,
    "Solicitando permisos y consultando la ubicacion actual..."
  );

  try {
    const coordinates = await requestCurrentCoordinates();

    DOM.studentForm.elements.namedItem("latitud").value =
      coordinates.latitude.toFixed(6);
    DOM.studentForm.elements.namedItem("longitud").value =
      coordinates.longitude.toFixed(6);

    renderLocationStatus(
      DOM.locationStatus,
      "Posicion obtenida. Traduciendo coordenadas con fetch..."
    );

    const geocodeResult = await reverseGeocodeCoordinates(
      coordinates.latitude,
      coordinates.longitude
    );

    DOM.studentForm.elements.namedItem("ubicacionTexto").value = geocodeResult.label;
    renderLocationStatus(
      DOM.locationStatus,
      "Ubicacion capturada correctamente desde la API JSON."
    );
    persistDraftFromForm();
  } catch (error) {
    console.error("Error al resolver la ubicacion.", error);
    renderLocationStatus(
      DOM.locationStatus,
      `${error.message} Puedes escribir la ubicacion manualmente.`
    );
    notify(
      "warning",
      "Ubicacion parcial",
      "No se pudo completar la geolocalizacion, pero el formulario sigue disponible."
    );
  } finally {
    DOM.locationButton.disabled = false;
  }
}

/**
 * Guarda el borrador actual del formulario en sessionStorage.
 */
function persistDraftFromForm() {
  if (DOM.studentModal.hidden) {
    return;
  }

  const values = readStudentForm();
  saveDraft({
    mode: STATE.editingId ? "edit" : "create",
    studentId: STATE.editingId,
    values,
  });
  renderStorageMeta();
}

/**
 * Persiste el estado actual de filtros en sessionStorage.
 */
function persistFilters() {
  saveFilters(STATE.filters);
  renderStorageMeta();
}

/**
 * Calcula metricas con Web Worker o usando respaldo local si falla.
 *
 * @param {Array<object>} students
 */
function updateMetrics(students) {
  if (STATE.worker) {
    try {
      STATE.worker.postMessage(students);
      return;
    } catch (error) {
      console.error("Error al enviar datos al worker.", error);
    }
  }

  const fallbackMetrics = computeMetricsFallback(students);
  renderMetrics(
    {
      total: DOM.metricTotal,
      active: DOM.metricActive,
      inactive: DOM.metricInactive,
      average: DOM.metricAverage,
      adults: DOM.metricAdults,
      located: DOM.metricLocated,
    },
    fallbackMetrics
  );
  renderCareerBreakdown(DOM.careerBreakdown, fallbackMetrics.porCarrera);
}

/**
 * Lee y normaliza los valores visibles del formulario.
 *
 * @returns {Record<string, any>}
 */
function readStudentForm() {
  const formData = new FormData(DOM.studentForm);

  return {
    carnet: formData.get("carnet"),
    correoInstitucional: formData.get("correoInstitucional"),
    nombres: formData.get("nombres"),
    apellidos: formData.get("apellidos"),
    edad: formData.get("edad"),
    telefono: formData.get("telefono"),
    encargado: formData.get("encargado"),
    direccion: formData.get("direccion"),
    carrera: formData.get("carrera"),
    ciclo: formData.get("ciclo"),
    promedio: formData.get("promedio"),
    estado: formData.get("estado"),
    ubicacionTexto: formData.get("ubicacionTexto"),
    latitud: formData.get("latitud"),
    longitud: formData.get("longitud"),
  };
}

/**
 * Regresa referencias utiles para los textos dinamicos del modal.
 *
 * @returns {{ modeBadge: HTMLElement, title: HTMLElement, submitButton: HTMLElement }}
 */
function getModalNodes() {
  return {
    modeBadge: DOM.modalModeBadge,
    title: DOM.modalTitle,
    submitButton: DOM.submitButton,
  };
}

/**
 * Actualiza el resumen del almacenamiento en el encabezado.
 */
function renderStorageMeta() {
  const filtersActive = Object.values(STATE.filters).filter(Boolean).length;
  const hasDraft = Boolean(getDraft().values);

  renderStorageStatus(DOM.storageStatus, {
    totalStudents: STATE.students.length,
    filtersActive,
    hasDraft,
  });
  DOM.draftIndicator.classList.toggle("d-none", !hasDraft);
}

/**
 * Busca el ultimo estudiante que tenga ubicacion registrada.
 *
 * @param {Array<object>} students
 * @returns {object|null}
 */
function findLatestLocatedStudent(students) {
  return (
    [...students]
      .sort((left, right) => {
        return new Date(right.fechaRegistro).getTime() - new Date(left.fechaRegistro).getTime();
      })
      .find(
        (student) =>
          student.ubicacionTexto ||
          (student.latitud !== null &&
            student.latitud !== "" &&
            student.longitud !== null &&
            student.longitud !== "")
      ) ?? null
  );
}

/**
 * Calcula metricas localmente como respaldo del worker.
 *
 * @param {Array<object>} students
 * @returns {Record<string, any>}
 */
function computeMetricsFallback(students) {
  const summary = {
    total: students.length,
    porEstado: {},
    porCarrera: {},
    promedioGeneral: 0,
    mayoresEdad: 0,
    menoresEdad: 0,
    conUbicacion: 0,
  };

  students.forEach((student) => {
    summary.porEstado[student.estado] = (summary.porEstado[student.estado] ?? 0) + 1;
    summary.porCarrera[student.carrera] = (summary.porCarrera[student.carrera] ?? 0) + 1;

    if (Number(student.edad) >= 18) {
      summary.mayoresEdad += 1;
    } else {
      summary.menoresEdad += 1;
    }

    if (
      student.ubicacionTexto ||
      (student.latitud !== null &&
        student.latitud !== "" &&
        student.longitud !== null &&
        student.longitud !== "")
    ) {
      summary.conUbicacion += 1;
    }
  });

  const totalScores = students.reduce((accumulator, student) => {
    return accumulator + Number(student.promedio ?? 0);
  }, 0);

  summary.promedioGeneral = students.length ? totalScores / students.length : 0;
  return summary;
}

/**
 * Regresa un identificador seguro para nuevos estudiantes.
 *
 * @returns {string}
 */
function createStudentId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `student-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Ordena los estudiantes por fecha de registro descendente.
 *
 * @param {Array<object>} students
 * @returns {Array<object>}
 */
function sortStudents(students) {
  return [...students].sort((left, right) => {
    return new Date(right.fechaRegistro).getTime() - new Date(left.fechaRegistro).getTime();
  });
}

/**
 * Atajo para mostrar mensajes consistentes.
 *
 * @param {"success"|"warning"|"error"} tone
 * @param {string} title
 * @param {string} message
 */
function notify(tone, title, message) {
  showFeedback(DOM.feedbackContainer, {
    tone,
    title,
    message,
  });
}

init();
