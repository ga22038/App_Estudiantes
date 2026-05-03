import { requestCurrentCoordinates, reverseGeocodeCoordinates } from "./api.js";
import { renderLocationStatus } from "./ui.js";
import { getStudentCoordinates } from "./student-utils.js";

export function createLocationMapController({ dom, persistDraftFromForm, notify }) {
  let map = null;
  let marker = null;

  function init() {
    const container = document.querySelector("#studentMap");
    if (!container || !window.L) return;

    if (!map) {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map("studentMap").setView([13.7942, -88.8965], 7);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      map.on("click", async (event) => {
        const { lat, lng } = event.latlng;
        setMarker(lat, lng);
        fillFormCoordinates(dom.studentForm, lat, lng);
        await geocodeMapPoint(lat, lng);
      });
    }

    refreshLayout();
  }

  function openForCreate() {
    renderLocationStatus(dom.locationStatus, "La ubicacion es opcional y no bloquea el guardado.");
    removeMarker();
    focusMapAtDefaultLocation();
  }

  function openForEdit(student) {
    renderLocationStatus(
      dom.locationStatus,
      student.ubicacionTexto
        ? "Puedes recapturar la ubicacion si deseas actualizarla."
        : "Este estudiante aun no tiene una ubicacion capturada."
    );

    const coordinates = getStudentCoordinates(student);

    if (coordinates) {
      setMarker(coordinates.lat, coordinates.lng);
      map?.setView([coordinates.lat, coordinates.lng], 13);
      return;
    }

    removeMarker();
    focusMapAtDefaultLocation();
  }

  async function resolveCurrentLocation() {
    const idleButtonContent = dom.locationButton.innerHTML;
    dom.locationButton.disabled = true;
    dom.locationButton.setAttribute("aria-busy", "true");
    dom.locationButton.innerHTML =
      '<span class="button-spinner" aria-hidden="true"></span> Buscando GPS...';

    renderLocationStatus(
      dom.locationStatus,
      "Solicitando permisos y consultando la ubicacion actual..."
    );

    try {
      const coordinates = await requestCurrentCoordinates();

      fillFormCoordinates(dom.studentForm, coordinates.latitude, coordinates.longitude);
      setMarker(coordinates.latitude, coordinates.longitude);
      map?.setView([coordinates.latitude, coordinates.longitude], 14);

      renderLocationStatus(
        dom.locationStatus,
        "Posicion obtenida. Traduciendo coordenadas con fetch..."
      );

      const geocodeResult = await reverseGeocodeCoordinates(
        coordinates.latitude,
        coordinates.longitude
      );

      dom.studentForm.elements.namedItem("ubicacionTexto").value = geocodeResult.label;
      renderLocationStatus(
        dom.locationStatus,
        "Ubicacion capturada correctamente desde la API JSON."
      );
      persistDraftFromForm();
    } catch (error) {
      console.error("Error al resolver la ubicacion.", error);
      renderLocationStatus(
        dom.locationStatus,
        `${error.message} Puedes escribir la ubicacion manualmente.`
      );
      notify(
        "warning",
        "Ubicacion parcial",
        "No se pudo completar la geolocalizacion, pero el formulario sigue disponible."
      );
    } finally {
      dom.locationButton.disabled = false;
      dom.locationButton.removeAttribute("aria-busy");
      dom.locationButton.innerHTML = idleButtonContent;
    }
  }

  function focusMapAtDefaultLocation() {
    window.setTimeout(() => {
      init();
      map?.setView([13.7942, -88.8965], 7);
    }, 0);
  }

  function setMarker(lat, lng) {
    if (marker) {
      marker.setLatLng([lat, lng]);
      marker.addTo(map);
      refreshLayout();
      return;
    }

    marker = L.marker([lat, lng], {
      draggable: true,
      icon: createLocationMarkerIcon(),
    }).addTo(map);

    refreshLayout();

    marker.on("dragend", async (event) => {
      const position = event.target.getLatLng();
      fillFormCoordinates(dom.studentForm, position.lat, position.lng);
      await geocodeMapPoint(position.lat, position.lng);
    });
  }

  function removeMarker() {
    if (marker) {
      marker.remove();
      marker = null;
    }
  }

  async function geocodeMapPoint(lat, lng) {
    renderLocationStatus(dom.locationStatus, "Obteniendo nombre del lugar...");
    try {
      const result = await reverseGeocodeCoordinates(lat, lng);
      dom.studentForm.elements.namedItem("ubicacionTexto").value = result.label;
      renderLocationStatus(dom.locationStatus, "Ubicacion seleccionada correctamente.");
      persistDraftFromForm();
    } catch {
      renderLocationStatus(
        dom.locationStatus,
        "No se pudo obtener el nombre. Puedes escribirlo manualmente."
      );
    }
  }

  function refreshLayout() {
    window.requestAnimationFrame(() => {
      map?.invalidateSize();
    });

    window.setTimeout(() => {
      map?.invalidateSize();
    }, 150);
  }

  return {
    init,
    openForCreate,
    openForEdit,
    resolveCurrentLocation,
  };
}

function createLocationMarkerIcon() {
  return L.divIcon({
    className: "student-location-marker",
    html: '<span aria-hidden="true"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function fillFormCoordinates(form, lat, lng) {
  form.elements.namedItem("latitud").value = lat.toFixed(6);
  form.elements.namedItem("longitud").value = lng.toFixed(6);
}
