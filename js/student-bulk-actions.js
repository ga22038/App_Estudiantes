import { buildDemoCatalog } from "./demo-data.js";
import { createStudentId } from "./student-utils.js";

export function createStudentBulkActions({
  state,
  persistStudents,
  clearDraft,
  clearFilters,
  defaultFilters,
  confirmation,
  view,
  notify,
}) {
  async function loadDemoStudents() {
    const shouldAppend = await confirmation.request({
      title: state.students.length ? "Agregar datos de ejemplo" : "Cargar datos de ejemplo",
      message: state.students.length
        ? "Ya hay registros guardados. Se agregaran datos de ejemplo sin borrar lo actual."
        : "Se cargaran estudiantes de ejemplo para la demostracion.",
      confirmText: state.students.length ? "Agregar demo" : "Cargar demo",
      tone: "warning",
    });

    if (!shouldAppend) {
      return;
    }

    const mergedByCarnet = new Map(
      state.students.map((student) => [String(student.carnet).toUpperCase(), student])
    );

    buildDemoCatalog(createStudentId).forEach((student) => {
      const carnetKey = String(student.carnet).toUpperCase();

      if (!mergedByCarnet.has(carnetKey)) {
        mergedByCarnet.set(carnetKey, student);
      }
    });

    persistStudents([...mergedByCarnet.values()]);
    view.renderApplication();

    notify(
      "success",
      "Datos de ejemplo listos",
      "La tabla fue poblada con estudiantes para tu presentacion."
    );
  }

  async function clearAllStudents() {
    const confirmed = await confirmation.request({
      title: "Limpiar registros",
      message: "Se eliminaran todos los registros del localStorage. Esta accion no se puede deshacer.",
      confirmText: "Limpiar registros",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      persistStudents([]);
      clearDraft();
      clearFilters();
      state.filters = { ...defaultFilters };
      view.hydrateFilterInputs();
      view.renderApplication();

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

  return {
    loadDemoStudents,
    clearAllStudents,
  };
}
