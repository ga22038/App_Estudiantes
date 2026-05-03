import { normalizeStudent, validateStudent } from "./validation.js";
import { renderFormErrors, resetForm } from "./ui.js";
import { createStudentId } from "./student-utils.js";

export function createStudentCrudActions({
  dom,
  state,
  getDraft,
  persistStudents,
  clearDraft,
  studentModal,
  confirmation,
  view,
  notify,
}) {
  function saveStudentFromForm() {
    try {
      const rawStudent = studentModal.readForm();
      const normalizedStudent = normalizeStudent(rawStudent);
      const validation = validateStudent(
        normalizedStudent,
        state.students,
        state.editingId
      );

      if (!validation.isValid) {
        renderFormErrors(dom.studentForm, validation.errors);
        notify(
          "warning",
          "Formulario incompleto",
          "Corrige los campos marcados antes de guardar."
        );
        return;
      }

      const existingStudent = state.students.find(
        (candidate) => candidate.id === state.editingId
      );

      const studentToSave = {
        ...(existingStudent ?? {}),
        ...normalizedStudent,
        id: existingStudent?.id ?? createStudentId(),
        fechaRegistro: existingStudent?.fechaRegistro ?? new Date().toISOString(),
      };

      const nextStudents = existingStudent
        ? state.students.map((student) =>
            student.id === existingStudent.id ? studentToSave : student
          )
        : [studentToSave, ...state.students];

      persistStudents(nextStudents);
      clearDraft();
      state.editingId = null;
      resetForm(dom.studentForm);
      studentModal.close();
      view.renderApplication();

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

  async function deleteStudent(studentId) {
    const student = state.students.find((candidate) => candidate.id === studentId);

    if (!student) {
      notify("error", "Registro no encontrado", "No fue posible eliminar el estudiante.");
      return;
    }

    const confirmed = await confirmation.request({
      title: "Eliminar estudiante",
      message: `Se eliminara a ${student.nombres} ${student.apellidos}. Esta accion no se puede deshacer.`,
      confirmText: "Eliminar",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      persistStudents(state.students.filter((candidate) => candidate.id !== studentId));

      const draft = getDraft();
      if (draft.studentId === studentId) {
        clearDraft();
      }

      view.renderApplication();
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

  return {
    saveStudentFromForm,
    deleteStudent,
  };
}
