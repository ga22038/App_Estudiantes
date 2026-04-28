const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s]{8,16}$/;

/**
 * Normaliza espacios repetidos para evitar entradas ruidosas.
 *
 * @param {string} value
 * @returns {string}
 */
function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Valida un objeto Student antes de guardarlo.
 *
 * @param {Record<string, any>} student
 * @param {Array<object>} students
 * @param {string|null} currentId
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateStudent(student, students, currentId = null) {
  const errors = {};
  const carnet = normalizeText(student.carnet).toUpperCase();
  const correo = normalizeText(student.correoInstitucional).toLowerCase();
  const nombres = normalizeText(student.nombres);
  const apellidos = normalizeText(student.apellidos);
  const telefono = normalizeText(student.telefono);
  const encargado = normalizeText(student.encargado);
  const direccion = normalizeText(student.direccion);
  const carrera = normalizeText(student.carrera);
  const ciclo = normalizeText(student.ciclo);
  const estado = normalizeText(student.estado);
  const promedio = Number(student.promedio);
  const edad = Number(student.edad);

  if (!carnet) {
    errors.carnet = "El carnet es obligatorio.";
  }

  if (!correo) {
    errors.correoInstitucional = "El correo institucional es obligatorio.";
  } else if (!EMAIL_PATTERN.test(correo)) {
    errors.correoInstitucional = "Ingresa un correo con formato válido.";
  }

  if (!nombres) {
    errors.nombres = "Los nombres son obligatorios.";
  }

  if (!apellidos) {
    errors.apellidos = "Los apellidos son obligatorios.";
  }

  if (!Number.isFinite(edad)) {
    errors.edad = "La edad es obligatoria.";
  } else if (edad < 15 || edad > 80) {
    errors.edad = "La edad debe estar entre 15 y 80.";
  }

  if (!telefono) {
    errors.telefono = "El teléfono es obligatorio.";
  } else if (!PHONE_PATTERN.test(telefono)) {
    errors.telefono = "Usa un teléfono válido de 8 a 16 caracteres.";
  }

  if (!encargado) {
    errors.encargado = "El nombre del encargado es obligatorio.";
  }

  if (!direccion) {
    errors.direccion = "La dirección es obligatoria.";
  }

  if (!carrera) {
    errors.carrera = "Selecciona una carrera.";
  }

  if (!ciclo) {
    errors.ciclo = "Selecciona el ciclo.";
  }

  if (!Number.isFinite(promedio)) {
    errors.promedio = "El promedio es obligatorio.";
  } else if (promedio < 0 || promedio > 10) {
    errors.promedio = "El promedio debe estar entre 0 y 10.";
  }

  if (!estado) {
    errors.estado = "Selecciona el estado del estudiante.";
  }

  const duplicateStudent = students.find((candidate) => {
    return (
      String(candidate.carnet ?? "").trim().toUpperCase() === carnet &&
      candidate.id !== currentId
    );
  });

  if (duplicateStudent) {
    errors.carnet = "Ya existe un estudiante registrado con este carnet.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Regresa una copia normalizada del estudiante para guardar datos limpios.
 *
 * @param {Record<string, any>} student
 * @returns {Record<string, any>}
 */
export function normalizeStudent(student) {
  return {
    ...student,
    carnet: normalizeText(student.carnet).toUpperCase(),
    correoInstitucional: normalizeText(student.correoInstitucional).toLowerCase(),
    nombres: normalizeText(student.nombres),
    apellidos: normalizeText(student.apellidos),
    telefono: normalizeText(student.telefono),
    direccion: normalizeText(student.direccion),
    encargado: normalizeText(student.encargado),
    carrera: normalizeText(student.carrera),
    ciclo: normalizeText(student.ciclo),
    promedio: Number(student.promedio),
    edad: Number(student.edad),
    estado: normalizeText(student.estado),
    ubicacionTexto: normalizeText(student.ubicacionTexto),
    latitud:
      student.latitud === "" || student.latitud === null
        ? null
        : Number(student.latitud),
    longitud:
      student.longitud === "" || student.longitud === null
        ? null
        : Number(student.longitud),
  };
}
