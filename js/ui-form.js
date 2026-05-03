export function populateForm(form, values) {
  const formFields = new FormData(form);

  Array.from(formFields.keys()).forEach((key) => {
    const field = form.elements.namedItem(key);

    if (field && "value" in field) {
      field.value = values?.[key] ?? "";
    }
  });
}

export function resetForm(form) {
  form.reset();
  clearFormErrors(form);
}

export function clearFormErrors(form) {
  form.querySelectorAll(".field-error").forEach((errorNode) => {
    errorNode.textContent = "";
  });

  form.querySelectorAll(".is-invalid-field").forEach((inputNode) => {
    inputNode.classList.remove("is-invalid-field");
  });
}

export function renderFormErrors(form, errors) {
  Object.entries(errors).forEach(([fieldName, message]) => {
    const inputNode = form.elements.namedItem(fieldName);
    const errorNode = form.querySelector(`[data-error-for="${fieldName}"]`);

    if (inputNode) {
      inputNode.classList.add("is-invalid-field");
    }

    if (errorNode) {
      errorNode.textContent = message;
    }
  });
}

export function toggleModal(modal, shouldOpen) {
  modal.hidden = !shouldOpen;
  document.body.classList.toggle("modal-is-open", shouldOpen);
}

export function renderModalMeta(modalNodes, isEditing) {
  modalNodes.modeBadge.textContent = isEditing ? "Modo edición" : "Nuevo registro";
  modalNodes.title.textContent = isEditing ? "Editar estudiante" : "Registrar estudiante";
  modalNodes.submitButton.textContent = isEditing
    ? "Actualizar estudiante"
    : "Guardar estudiante";
}

export function renderLocationStatus(node, message) {
  node.textContent = message;
}
