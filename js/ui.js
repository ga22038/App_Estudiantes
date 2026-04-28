/**
 * Escapa caracteres especiales de HTML para prevenir ataques XSS.
 * Siempre usa esta función antes de insertar texto del usuario con innerHTML.
 * Sin esto, un atacante podría inyectar etiquetas <script> u otro HTML malicioso.
 *
 * @param {string} value - Texto que puede contener caracteres peligrosos.
 * @returns {string} Texto seguro para insertar en el DOM.
 */
export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const CAREER_LABELS = Object.freeze({
  "Ingenieria en Desarrollo de Software": "Ingeniería en Desarrollo de Software",
  "Ingenieria Industrial": "Ingeniería Industrial",
  "Administracion de Empresas": "Administración de Empresas",
  "Contaduria Publica": "Contaduría Pública",
});

/**
 * Muestra nombres de carrera con tildes sin romper datos guardados previamente.
 *
 * @param {string} career
 * @returns {string}
 */
export function formatCareerName(career) {
  const normalizedCareer = String(career ?? "").trim();
  return CAREER_LABELS[normalizedCareer] ?? normalizedCareer;
}

/**
 * Formatea una fecha ISO para mostrarla de manera amigable.
 *
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  if (!isoDate) {
    return "Sin fecha";
  }

  try {
    return new Intl.DateTimeFormat("es-SV", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoDate));
  } catch (error) {
    console.error("No fue posible formatear la fecha.", error);
    return isoDate;
  }
}

/**
 * Regresa la clase CSS correspondiente al estado del estudiante.
 *
 * @param {string} status
 * @returns {string}
 */
function resolveStatusClass(status) {
  const normalized = String(status ?? "").trim().toLowerCase();

  if (normalized === "activo") {
    return "status-badge status-badge--activo";
  }

  if (normalized === "becado") {
    return "status-badge status-badge--becado";
  }

  if (normalized === "egresado") {
    return "status-badge status-badge--egresado";
  }

  return "status-badge status-badge--inactivo";
}

/**
 * Rellena la tabla principal con los estudiantes filtrados.
 *
 * @param {HTMLElement} tableBody
 * @param {Array<object>} students
 */
export function renderStudentTable(tableBody, students) {
  if (!students.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-table">
          No hay estudiantes para mostrar con los filtros actuales.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = students
    .map((student) => {
      const fullName = `${escapeHtml(student.nombres)} ${escapeHtml(student.apellidos)}`;
      const locationLabel = student.ubicacionTexto
        ? escapeHtml(student.ubicacionTexto)
        : "Sin ubicación";

      return `
        <tr>
          <td data-label="Carnet">
            <strong>${escapeHtml(student.carnet)}</strong>
            <div class="cell-muted">${formatDate(student.fechaRegistro)}</div>
          </td>
          <td data-label="Estudiante">
            <div class="student-name">
              <strong>${fullName}</strong>
              <span>${escapeHtml(student.correoInstitucional)}</span>
            </div>
          </td>
          <td data-label="Carrera">
            <div class="student-name">
              <strong>${escapeHtml(formatCareerName(student.carrera))}</strong>
              <span>Ciclo ${escapeHtml(student.ciclo)}</span>
            </div>
          </td>
          <td data-label="Estado">
            <span class="${resolveStatusClass(student.estado)}">
              ${escapeHtml(student.estado)}
            </span>
          </td>
          <td data-label="Promedio">
            <strong>${Number(student.promedio ?? 0).toFixed(2)}</strong>
            <div class="cell-muted">${escapeHtml(String(student.edad))} años</div>
          </td>
          <td data-label="Ubicación">
            <div class="student-name">
              <strong>${locationLabel}</strong>
              <span>${escapeHtml(student.telefono)}</span>
            </div>
          </td>
          <td data-label="Acciones">
            <div class="table-actions">
              <button
                type="button"
                class="btn app-ghost-button btn-sm-action"
                data-action="edit"
                data-id="${escapeHtml(student.id)}"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar
              </button>
              <button
                type="button"
                class="btn app-danger-button btn-sm-action"
                data-action="delete"
                data-id="${escapeHtml(student.id)}"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

/**
 * Actualiza las métricas visibles del dashboard.
 *
 * @param {Record<string, HTMLElement>} metricNodes
 * @param {Record<string, any>} metrics
 */
export function renderMetrics(metricNodes, metrics) {
  metricNodes.total.textContent = String(metrics.total ?? 0);
  metricNodes.active.textContent = String(metrics.porEstado?.Activo ?? 0);
  metricNodes.inactive.textContent = String(metrics.porEstado?.Inactivo ?? 0);
  metricNodes.average.textContent = Number(metrics.promedioGeneral ?? 0).toFixed(2);
  metricNodes.adults.textContent = String(metrics.mayoresEdad ?? 0);
  metricNodes.located.textContent = String(metrics.conUbicacion ?? 0);
}

/**
 * Pinta el resumen lateral de estudiantes por carrera.
 *
 * @param {HTMLElement} container
 * @param {Record<string, number>} byCareer
 */
export function renderCareerBreakdown(container, byCareer) {
  const entries = Object.entries(byCareer ?? {}).reduce((accumulator, [career, total]) => {
    const careerLabel = formatCareerName(career);
    accumulator.set(careerLabel, (accumulator.get(careerLabel) ?? 0) + total);
    return accumulator;
  }, new Map());

  if (!entries.size) {
    container.innerHTML =
      '<div class="career-pill"><strong>Sin datos</strong><span>Agrega estudiantes para ver el resumen.</span></div>';
    return;
  }

  container.innerHTML = [...entries]
    .sort((left, right) => right[1] - left[1])
    .map(([career, total]) => {
      return `
        <div class="career-pill">
          <div>
            <strong>${escapeHtml(career)}</strong>
            <span>Estudiantes registrados</span>
          </div>
          <strong>${total}</strong>
        </div>
      `;
    })
    .join("");
}

/**
 * Actualiza el contador de resultados visibles.
 *
 * @param {HTMLElement} summaryNode
 * @param {number} visibleTotal
 * @param {number} completeTotal
 */
export function renderResultsSummary(summaryNode, visibleTotal, completeTotal) {
  summaryNode.textContent = `Mostrando ${visibleTotal} de ${completeTotal} registros`;
}

/**
 * Muestra la última ubicación registrada disponible.
 *
 * @param {HTMLElement} container
 * @param {object|null} student
 */
export function renderLatestLocation(container, student) {
  if (!student) {
    container.textContent = "Aún no hay ubicaciones registradas.";
    return;
  }

  const locationLabel =
    student.ubicacionTexto ||
    `Lat ${String(student.latitud ?? "-")}, Lng ${String(student.longitud ?? "-")}`;

  container.innerHTML = `
    <strong>${escapeHtml(locationLabel)}</strong>
    <span class="cell-muted">Capturada para ${escapeHtml(student.nombres)} ${escapeHtml(
      student.apellidos
    )}.</span>
    <br />
    <span class="cell-muted">Coordenadas: ${escapeHtml(
      student.latitud ?? "-"
    )}, ${escapeHtml(student.longitud ?? "-")}</span>
  `;
}

/**
 * Rellena el formulario cuando se edita un estudiante o se recupera un borrador.
 *
 * @param {HTMLFormElement} form
 * @param {Record<string, any>} values
 */
export function populateForm(form, values) {
  const formFields = new FormData(form);

  Array.from(formFields.keys()).forEach((key) => {
    const field = form.elements.namedItem(key);

    if (field && "value" in field) {
      field.value = values?.[key] ?? "";
    }
  });
}

/**
 * Limpia el contenido del formulario y los errores visibles.
 *
 * @param {HTMLFormElement} form
 */
export function resetForm(form) {
  form.reset();
  clearFormErrors(form);
}

/**
 * Limpia el estado visual de error de todos los campos del formulario.
 *
 * @param {HTMLFormElement} form
 */
export function clearFormErrors(form) {
  form.querySelectorAll(".field-error").forEach((errorNode) => {
    errorNode.textContent = "";
  });

  form.querySelectorAll(".is-invalid-field").forEach((inputNode) => {
    inputNode.classList.remove("is-invalid-field");
  });
}

/**
 * Pinta errores por campo debajo de cada control del formulario.
 *
 * @param {HTMLFormElement} form
 * @param {Record<string, string>} errors
 */
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

/**
 * Muestra u oculta el modal principal.
 *
 * @param {HTMLElement} modal
 * @param {boolean} shouldOpen
 */
export function toggleModal(modal, shouldOpen) {
  modal.hidden = !shouldOpen;
  document.body.classList.toggle("modal-is-open", shouldOpen);
}

/**
 * Actualiza los textos del modal según el modo actual.
 *
 * @param {Record<string, HTMLElement>} modalNodes
 * @param {boolean} isEditing
 */
export function renderModalMeta(modalNodes, isEditing) {
  modalNodes.modeBadge.textContent = isEditing ? "Modo edición" : "Nuevo registro";
  modalNodes.title.textContent = isEditing
    ? "Editar estudiante"
    : "Registrar estudiante";
  modalNodes.submitButton.textContent = isEditing
    ? "Actualizar estudiante"
    : "Guardar estudiante";
}

/**
 * Pinta un mensaje de ubicación en el formulario.
 *
 * @param {HTMLElement} node
 * @param {string} message
 */
export function renderLocationStatus(node, message) {
  node.textContent = message;
}

/**
 * Muestra una alerta temporal en la parte superior de la página.
 *
 * @param {HTMLElement} container
 * @param {{ tone: "success"|"warning"|"error", title: string, message: string }} config
 */
export function showFeedback(container, config) {
  const alert = document.createElement("article");
  alert.className = "app-alert";
  alert.dataset.tone = config.tone;
  alert.innerHTML = `
    <div>
      <strong>${escapeHtml(config.title)}</strong>
      <p>${escapeHtml(config.message)}</p>
    </div>
    <button type="button" class="btn-close" aria-label="Cerrar mensaje"></button>
  `;

  const closeButton = alert.querySelector(".btn-close");
  closeButton?.addEventListener("click", () => alert.remove());

  container.prepend(alert);

  window.setTimeout(() => {
    alert.remove();
  }, 5000);
}

/**
 * Pinta el estado del storage dentro del encabezado.
 *
 * @param {HTMLElement} container
 * @param {{ totalStudents: number, filtersActive: number, hasDraft: boolean }} meta
 */
export function renderStorageStatus(container, meta) {
  const items = [
    ["Estudiantes", String(meta.totalStudents)],
    ["Filtros activos", String(meta.filtersActive)],
    ["Borrador", meta.hasDraft ? "Disponible" : "Sin borrador"],
  ];

  container.innerHTML = items
    .map(([label, value]) => {
      return `
        <div class="hero-meta-item">
          <span class="hero-meta-label">${escapeHtml(label)}</span>
          <span class="hero-meta-value">${escapeHtml(value)}</span>
        </div>
      `;
    })
    .join("");
}

/**
 * Pinta las opciones de carrera usadas por el filtro.
 *
 * @param {HTMLSelectElement} select
 * @param {string[]} careers
 * @param {string} selectedValue
 */
export function renderCareerOptions(select, careers, selectedValue = "") {
  const uniqueCareers = [...new Set(careers.filter(Boolean))].sort((left, right) =>
    left.localeCompare(right)
  );
  const optionsSignature = JSON.stringify(uniqueCareers);

  if (select.dataset.optionsSignature !== optionsSignature) {
    select.innerHTML = `
      <option value="">Todas las carreras</option>
      ${uniqueCareers
        .map((career) => {
          return `<option value="${escapeHtml(career)}">${escapeHtml(formatCareerName(career))}</option>`;
        })
        .join("")}
    `;
    select.dataset.optionsSignature = optionsSignature;
  }

  select.value = selectedValue;
}
