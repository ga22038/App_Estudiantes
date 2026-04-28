/**
 * Worker dedicado a calcular métricas del dashboard sin bloquear la UI.
 */
function hasValidCoordinateValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return Number.isFinite(Number(value));
}

function studentHasLocation(student) {
  return (
    Boolean(String(student?.ubicacionTexto ?? "").trim()) ||
    (hasValidCoordinateValue(student?.latitud) &&
      hasValidCoordinateValue(student?.longitud))
  );
}

self.onmessage = (event) => {
  const students = Array.isArray(event.data) ? event.data : [];

  const summary = {
    total: students.length,
    porEstado: {},
    porCarrera: {},
    promedioGeneral: 0,
    mayoresEdad: 0,
    menoresEdad: 0,
    conUbicacion: 0,
  };

  let scoreAccumulator = 0;

  students.forEach((student) => {
    summary.porEstado[student.estado] = (summary.porEstado[student.estado] ?? 0) + 1;
    summary.porCarrera[student.carrera] = (summary.porCarrera[student.carrera] ?? 0) + 1;

    if (Number(student.edad) >= 18) {
      summary.mayoresEdad += 1;
    } else {
      summary.menoresEdad += 1;
    }

    if (studentHasLocation(student)) {
      summary.conUbicacion += 1;
    }

    scoreAccumulator += Number(student.promedio ?? 0);
  });

  summary.promedioGeneral = students.length ? scoreAccumulator / students.length : 0;

  self.postMessage(summary);
};
