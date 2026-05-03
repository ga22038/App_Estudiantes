export function hasValidCoordinateValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return Number.isFinite(Number(value));
}

export function getStudentCoordinates(student) {
  if (
    !hasValidCoordinateValue(student?.latitud) ||
    !hasValidCoordinateValue(student?.longitud)
  ) {
    return null;
  }

  return {
    lat: Number(student.latitud),
    lng: Number(student.longitud),
  };
}

export function studentHasLocation(student) {
  return (
    Boolean(String(student?.ubicacionTexto ?? "").trim()) ||
    Boolean(getStudentCoordinates(student))
  );
}

export function applyFilters(students, filters) {
  const searchTerm = String(filters.search ?? "").trim().toLowerCase();

  return students.filter((student) => {
    const matchesSearch =
      !searchTerm ||
      [
        student.carnet,
        student.nombres,
        student.apellidos,
        `${student.nombres} ${student.apellidos}`,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);

    const matchesCareer =
      !filters.career || String(student.carrera) === String(filters.career);
    const matchesStatus =
      !filters.status || String(student.estado) === String(filters.status);

    return matchesSearch && matchesCareer && matchesStatus;
  });
}

export function findLatestLocatedStudent(students) {
  return sortStudents(students).find(studentHasLocation) ?? null;
}

export function computeMetricsFallback(students) {
  const summary = {
    total: students.length,
    porEstado: {},
    porCarrera: {},
    promedioGeneral: 0,
    mayoresEdad: 0,
    menoresEdad: 0,
    conUbicacion: 0,
  };

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
  });

  const totalScores = students.reduce((accumulator, student) => {
    return accumulator + Number(student.promedio ?? 0);
  }, 0);

  summary.promedioGeneral = students.length ? totalScores / students.length : 0;
  return summary;
}

export function createStudentId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `student-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function sortStudents(students) {
  return [...students].sort((left, right) => {
    return new Date(right.fechaRegistro).getTime() - new Date(left.fechaRegistro).getTime();
  });
}
