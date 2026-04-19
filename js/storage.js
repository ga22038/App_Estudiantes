/**
 * Claves publicas del almacenamiento utilizadas por la aplicacion.
 */
export const STORAGE_KEYS = Object.freeze({
  students: "students_registry_v1",
  draft: "students_form_draft_v1",
  filters: "students_filters_v1",
});

/**
 * Lee un valor JSON desde un area de storage y regresa un fallback si algo falla.
 *
 * @param {Storage} storageArea
 * @param {string} key
 * @param {any} fallbackValue
 * @returns {any}
 */
function readJson(storageArea, key, fallbackValue) {
  try {
    const rawValue = storageArea.getItem(key);

    if (!rawValue) {
      return fallbackValue;
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue ?? fallbackValue;
  } catch (error) {
    console.error(`No fue posible leer la clave "${key}" del storage.`, error);
    return fallbackValue;
  }
}

/**
 * Guarda un valor serializado en el storage indicado.
 *
 * @param {Storage} storageArea
 * @param {string} key
 * @param {any} value
 * @returns {boolean}
 */
function writeJson(storageArea, key, value) {
  try {
    storageArea.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`No fue posible guardar la clave "${key}" en el storage.`, error);
    return false;
  }
}

/**
 * Regresa la lista persistida de estudiantes.
 *
 * @returns {Array<object>}
 */
export function getStudents() {
  return readJson(window.localStorage, STORAGE_KEYS.students, []);
}

/**
 * Persiste el arreglo principal de estudiantes.
 *
 * @param {Array<object>} students
 * @returns {boolean}
 */
export function saveStudents(students) {
  return writeJson(window.localStorage, STORAGE_KEYS.students, students);
}

/**
 * Obtiene el borrador guardado del formulario.
 *
 * @returns {{ mode?: string, studentId?: string|null, values?: Record<string, any> }}
 */
export function getDraft() {
  return readJson(window.sessionStorage, STORAGE_KEYS.draft, {});
}

/**
 * Guarda un borrador del formulario en sessionStorage.
 *
 * @param {{ mode: string, studentId: string|null, values: Record<string, any> }} draft
 * @returns {boolean}
 */
export function saveDraft(draft) {
  return writeJson(window.sessionStorage, STORAGE_KEYS.draft, draft);
}

/**
 * Elimina el borrador actual del formulario.
 */
export function clearDraft() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEYS.draft);
  } catch (error) {
    console.error("No fue posible limpiar el borrador del formulario.", error);
  }
}

/**
 * Obtiene el estado persistido de los filtros.
 *
 * @returns {{ search: string, career: string, status: string }}
 */
export function getFilters() {
  return readJson(window.sessionStorage, STORAGE_KEYS.filters, {
    search: "",
    career: "",
    status: "",
  });
}

/**
 * Persiste la configuracion actual de filtros.
 *
 * @param {{ search: string, career: string, status: string }} filters
 * @returns {boolean}
 */
export function saveFilters(filters) {
  return writeJson(window.sessionStorage, STORAGE_KEYS.filters, filters);
}

/**
 * Elimina los filtros de la sesion actual.
 */
export function clearFilters() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEYS.filters);
  } catch (error) {
    console.error("No fue posible limpiar los filtros de la sesion.", error);
  }
}
