import {
  renderCareerOptions,
  renderLatestLocation,
  renderResultsSummary,
  renderStorageStatus,
  renderStudentTable,
} from "./ui.js";
import { applyFilters, findLatestLocatedStudent } from "./student-utils.js";

export function createAppView({ dom, state, getDraft, studentsMap, metrics, notify }) {
  function renderApplication() {
    try {
      state.filteredStudents = applyFilters(state.students, state.filters);

      renderCareerOptions(
        dom.careerFilter,
        state.students.map((student) => student.carrera),
        state.filters.career
      );
      renderStudentTable(dom.studentTableBody, state.filteredStudents);
      renderResultsSummary(
        dom.resultsSummary,
        state.filteredStudents.length,
        state.students.length
      );
      studentsMap.update(state.filteredStudents);
      renderStorageMeta();
      renderLatestLocation(
        dom.latestLocationCard,
        findLatestLocatedStudent(state.filteredStudents)
      );
      metrics.update(state.filteredStudents);
    } catch (error) {
      console.error("Error al renderizar la aplicacion.", error);
      notify(
        "error",
        "Error de interfaz",
        "No fue posible actualizar la vista. Revisa la consola del navegador."
      );
    }
  }

  function hydrateFilterInputs() {
    dom.searchInput.value = state.filters.search;
    dom.careerFilter.value = state.filters.career;
    dom.statusFilter.value = state.filters.status;
  }

  function renderStorageMeta() {
    const filtersActive = Object.values(state.filters).filter(Boolean).length;
    const hasDraft = Boolean(getDraft().values);

    renderStorageStatus(dom.storageStatus, {
      totalStudents: state.students.length,
      filtersActive,
      hasDraft,
    });
    dom.draftIndicator.classList.toggle("d-none", !hasDraft);
  }

  return {
    renderApplication,
    hydrateFilterInputs,
    renderStorageMeta,
  };
}
