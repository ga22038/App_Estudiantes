const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 0,
};

/**
 * Solicita la posicion actual del navegador y la devuelve como promesa.
 *
 * @returns {Promise<{ latitude: number, longitude: number }>}
 */
export function requestCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Este navegador no soporta geolocalizacion."));
      return;
    }

    if (!window.isSecureContext) {
      reject(
        new Error(
          "La geolocalizacion requiere HTTPS o localhost para funcionar."
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(resolveGeolocationMessage(error)));
      },
      GEOLOCATION_OPTIONS
    );
  });
}

/**
 * Traduce coordenadas GPS a una etiqueta de ubicacion legible por humanos.
 * La llamada usa fetch para cumplir el requisito del proyecto.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{ label: string, payload: Record<string, any> }>}
 */
export async function reverseGeocodeCoordinates(latitude, longitude) {
  const endpoint = new URL("https://api-bdc.net/data/reverse-geocode");
  endpoint.searchParams.set("latitude", String(latitude));
  endpoint.searchParams.set("longitude", String(longitude));
  endpoint.searchParams.set("localityLanguage", "es");

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("No fue posible consultar la ubicacion en el servicio externo.");
  }

  const payload = await response.json();
  const label = buildLocationLabel(payload, latitude, longitude);

  return { label, payload };
}

/**
 * Regresa un mensaje mas humano a partir del error del navegador.
 *
 * @param {GeolocationPositionError} error
 * @returns {string}
 */
function resolveGeolocationMessage(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Permiso de geolocalizacion denegado por el usuario.";
    case error.POSITION_UNAVAILABLE:
      return "No fue posible obtener la posicion actual.";
    case error.TIMEOUT:
      return "La geolocalizacion excedio el tiempo de espera.";
    default:
      return "Ocurrio un error inesperado con la geolocalizacion.";
  }
}

/**
 * Construye una etiqueta breve a partir de la respuesta JSON del servicio.
 *
 * @param {Record<string, any>} payload
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string}
 */
function buildLocationLabel(payload, latitude, longitude) {
  const locationParts = [
    payload.locality,
    payload.city,
    payload.principalSubdivision,
    payload.countryName,
  ].filter(Boolean);

  if (locationParts.length > 0) {
    return locationParts.join(", ");
  }

  return `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`;
}
