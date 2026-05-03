import { escapeHtml, formatCareerName } from "./ui.js";
import { getStudentCoordinates } from "./student-utils.js";

const STATUS_THEME = {
  Activo: {
    markerColor: "--status-active-marker",
    badgeClass: "status-badge--activo",
  },
  Becado: {
    markerColor: "--status-scholar-marker",
    badgeClass: "status-badge--becado",
  },
  Egresado: {
    markerColor: "--status-graduate-marker",
    badgeClass: "status-badge--egresado",
  },
  Inactivo: {
    markerColor: "--status-inactive-marker",
    badgeClass: "status-badge--inactivo",
  },
};

const DEFAULT_STATUS_THEME = {
  markerColor: "--status-neutral-marker",
  badgeClass: "status-badge--neutral",
};

export function createStudentsMapController(dom) {
  let map = null;
  let layer = null;

  function init() {
    if (!dom.studentsMap || !window.L || map) return;

    map = L.map("studentsMap").setView([13.7942, -88.8965], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    layer = L.layerGroup().addTo(map);
  }

  function update(students) {
    if (!map || !layer) return;

    layer.clearLayers();

    const located = students.reduce((accumulator, student) => {
      const coordinates = getStudentCoordinates(student);
      if (coordinates) {
        accumulator.push({ student, coordinates });
      }
      return accumulator;
    }, []);

    if (dom.studentsMapEmpty) {
      dom.studentsMapEmpty.hidden = located.length > 0;
    }

    located.forEach(({ student, coordinates }) => {
      const statusTheme = getStatusTheme(student.estado);
      const marker = L.circleMarker([coordinates.lat, coordinates.lng], {
        radius: 9,
        fillColor: getCssVariable(statusTheme.markerColor, DEFAULT_STATUS_THEME.markerColor),
        color: getCssVariable("--leaflet-marker-ring", "--color-surface"),
        weight: 2,
        opacity: 1,
        fillOpacity: 0.88,
      });

      marker.bindPopup(`
        <strong>${escapeHtml(student.nombres)} ${escapeHtml(student.apellidos)}</strong><br/>
        <span class="map-popup-muted">${escapeHtml(student.carnet)}</span><br/>
        <span class="map-popup-muted">${escapeHtml(formatCareerName(student.carrera))}</span><br/>
        <span class="status-badge ${statusTheme.badgeClass}">
          ${escapeHtml(student.estado)}
        </span>
      `);

      layer.addLayer(marker);
    });

    if (dom.mapStudentCount) {
      dom.mapStudentCount.textContent =
        located.length === 1 ? "1 marcador" : `${located.length} marcadores`;
    }

    fitMapToLocatedStudents(located);
  }

  function fitMapToLocatedStudents(located) {
    if (!map) return;

    if (located.length > 1) {
      const bounds = L.featureGroup(
        located.map(({ coordinates }) => L.circleMarker([coordinates.lat, coordinates.lng]))
      ).getBounds();
      map.fitBounds(bounds, { padding: [40, 40] });
      return;
    }

    if (located.length === 1) {
      map.setView([located[0].coordinates.lat, located[0].coordinates.lng], 13);
      return;
    }

    map.setView([13.7942, -88.8965], 7);
  }

  return {
    init,
    update,
  };
}

function getCssVariable(variableName, fallbackVariableName = "") {
  const styles = getComputedStyle(document.documentElement);
  const value = resolveCssVariable(styles, variableName);

  if (value) {
    return value;
  }

  if (fallbackVariableName) {
    return resolveCssVariable(styles, fallbackVariableName) || styles.color;
  }

  return styles.color;
}

function resolveCssVariable(styles, variableName) {
  let value = styles.getPropertyValue(variableName).trim();

  for (let depth = 0; depth < 3 && value.startsWith("var("); depth += 1) {
    const nestedVariable = value.match(/^var\((--[\w-]+)\)$/)?.[1];

    if (!nestedVariable) {
      break;
    }

    value = styles.getPropertyValue(nestedVariable).trim();
  }

  return value;
}

function getStatusTheme(status) {
  return STATUS_THEME[status] ?? DEFAULT_STATUS_THEME;
}
