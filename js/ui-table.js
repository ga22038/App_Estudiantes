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

export function formatCareerName(career) {
  const normalizedCareer = String(career ?? "").trim();
  return CAREER_LABELS[normalizedCareer] ?? normalizedCareer;
}

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
                Editar
              </button>
              <button
                type="button"
                class="btn app-danger-button btn-sm-action"
                data-action="delete"
                data-id="${escapeHtml(student.id)}"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

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

function resolveStatusClass(status) {
  const normalized = String(status ?? "").trim().toLowerCase();

  if (normalized === "activo") return "status-badge status-badge--activo";
  if (normalized === "becado") return "status-badge status-badge--becado";
  if (normalized === "egresado") return "status-badge status-badge--egresado";

  return "status-badge status-badge--inactivo";
}
