import {
  clearFormErrors,
  populateForm,
  renderLocationStatus,
  renderModalMeta,
  resetForm,
  toggleModal,
} from "./ui.js";

export function createStudentModalController({
  dom,
  state,
  getModalNodes,
  getDraft,
  locationMap,
  persistDraftFromForm,
}) {
  function bindEvents({ onSubmit }) {
    dom.closeModalButton?.addEventListener("click", close);
    dom.cancelModalButton?.addEventListener("click", close);

    dom.studentModal?.addEventListener("click", (event) => {
      if (event.target === dom.studentModal) {
        close();
      }
    });

    dom.studentForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      onSubmit();
    });

    dom.studentForm?.addEventListener("input", () => {
      clearFormErrors(dom.studentForm);
      persistDraftFromForm();
    });

    dom.studentForm?.addEventListener("change", () => {
      persistDraftFromForm();
    });
  }

  function openCreate() {
    state.editingId = null;
    resetForm(dom.studentForm);
    renderModalMeta(getModalNodes(), false);

    const draft = getDraft();

    if (draft.mode === "create" && draft.values) {
      populateForm(dom.studentForm, draft.values);
      dom.formStatusText.textContent =
        "Se recupero el borrador guardado en la sesion actual.";
    } else {
      dom.formStatusText.textContent =
        "El formulario guarda borrador en sessionStorage.";
    }

    locationMap.openForCreate();
    toggleModal(dom.studentModal, true);
    focusFirstField();
  }

  function openEdit(student) {
    state.editingId = student.id;
    resetForm(dom.studentForm);
    renderModalMeta(getModalNodes(), true);

    const draft = getDraft();

    if (draft.mode === "edit" && draft.studentId === student.id && draft.values) {
      populateForm(dom.studentForm, draft.values);
      dom.formStatusText.textContent =
        "Se recupero un borrador de edicion pendiente de la sesion.";
    } else {
      populateForm(dom.studentForm, student);
      dom.formStatusText.textContent =
        "Edita los datos y guarda los cambios para actualizar el registro.";
    }

    renderLocationStatus(
      dom.locationStatus,
      student.ubicacionTexto
        ? "Puedes recapturar la ubicacion si deseas actualizarla."
        : "Este estudiante aun no tiene una ubicacion capturada."
    );

    toggleModal(dom.studentModal, true);
    window.setTimeout(() => {
      locationMap.init();
      locationMap.openForEdit(student);
    }, 0);
    focusFirstField();
  }

  function close() {
    toggleModal(dom.studentModal, false);
    clearFormErrors(dom.studentForm);
  }

  function readForm() {
    const formData = new FormData(dom.studentForm);

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

  function handleEscape() {
    if (isOpen()) {
      close();
      return true;
    }

    return false;
  }

  function isOpen() {
    return Boolean(dom.studentModal && !dom.studentModal.hidden);
  }

  function focusFirstField() {
    dom.studentForm.elements.namedItem("carnet")?.focus();
  }

  return {
    bindEvents,
    openCreate,
    openEdit,
    close,
    readForm,
    handleEscape,
    isOpen,
  };
}
