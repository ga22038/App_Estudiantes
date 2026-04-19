/**
 * Worker dedicado a calcular metricas del dashboard sin bloquear la UI.
 */
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

    if (
      student.ubicacionTexto ||
      (student.latitud !== null &&
        student.latitud !== "" &&
        student.longitud !== null &&
        student.longitud !== "")
    ) {
      summary.conUbicacion += 1;
    }

    scoreAccumulator += Number(student.promedio ?? 0);
  });

  summary.promedioGeneral = students.length ? scoreAccumulator / students.length : 0;

  self.postMessage(summary);
};
