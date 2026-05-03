import { sortStudents } from "./student-utils.js";
import { createStudentCrudActions } from "./student-crud-actions.js";
import { createStudentBulkActions } from "./student-bulk-actions.js";

export function createStudentActions(config) {
  const persistStudents = createStudentPersistence({
    state: config.state,
    saveStudents: config.saveStudents,
  });

  return {
    ...createStudentCrudActions({
      ...config,
      persistStudents,
    }),
    ...createStudentBulkActions({
      ...config,
      persistStudents,
    }),
  };
}

function createStudentPersistence({ state, saveStudents }) {
  return function persistStudents(students) {
    const orderedStudents = sortStudents(students);

    if (!saveStudents(orderedStudents)) {
      throw new Error("No se pudo persistir la informacion en localStorage.");
    }

    state.students = orderedStudents;
  };
}
