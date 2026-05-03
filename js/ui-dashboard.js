import { escapeHtml, formatCareerName } from "./ui-table.js";

export function renderMetrics(metricNodes, metrics) {
  metricNodes.total.textContent = String(metrics.total ?? 0);
  metricNodes.active.textContent = String(metrics.porEstado?.Activo ?? 0);
  metricNodes.inactive.textContent = String(metrics.porEstado?.Inactivo ?? 0);
  metricNodes.average.textContent = Number(metrics.promedioGeneral ?? 0).toFixed(2);
  metricNodes.adults.textContent = String(metrics.mayoresEdad ?? 0);
  metricNodes.located.textContent = String(metrics.conUbicacion ?? 0);
}

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

export function renderResultsSummary(summaryNode, visibleTotal, completeTotal) {
  summaryNode.textContent = `Mostrando ${visibleTotal} de ${completeTotal} registros`;
}

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
