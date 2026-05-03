# Registro basico de estudiantes

Aplicacion web frontend creada para el proyecto final de `DTW135 - Desarrollo y Tecnicas de Aplicaciones Web`. El sistema implementa un CRUD completo de estudiantes usando solo `HTML5`, `CSS3`, `JavaScript`, `localStorage`, `sessionStorage`, `fetch`, `geolocalizacion` y `Web Worker`.

## Datos del equipo

Completa esta seccion antes de entregar:

- Grupo: `GT01`
- Tema: `Registro basico de estudiantes`
- Integrantes:
  - Pendiente de completar
  - Pendiente de completar
  - Pendiente de completar

## Tecnologias usadas

- HTML5 semantico
- CSS3 con organizacion por bloques comentados
- JavaScript modular con ES Modules
- Bootstrap 5 por CDN como base de layout
- Fuente `Manrope` por CDN
- `localStorage` para persistencia principal
- `sessionStorage` para borrador del formulario y filtros
- `fetch` para reverse geocoding en JSON
- `navigator.geolocation` para capturar coordenadas
- `Web Worker` para metricas del dashboard

## Estructura del proyecto

```text
.
|-- css/
|   `-- styles.css
|-- js/
|   |-- api.js
|   |-- app-state.js
|   |-- app-view.js
|   |-- app.js
|   |-- confirmation-modal.js
|   |-- demo-data.js
|   |-- location-map.js
|   |-- metrics-controller.js
|   |-- storage.js
|   |-- student-actions.js
|   |-- student-bulk-actions.js
|   |-- student-crud-actions.js
|   |-- student-modal.js
|   |-- student-utils.js
|   |-- students-map.js
|   |-- ui-dashboard.js
|   |-- ui-feedback.js
|   |-- ui-form.js
|   |-- ui-table.js
|   |-- ui.js
|   |-- validation.js
|   `-- workers/
|       `-- student-metrics.worker.js
|-- index.html
`-- README.md
```

## Requisitos del documento y donde estan implementados

1. CRUD completo con JavaScript y manejo de errores
   - Crear, editar, eliminar y listar desde `js/app.js`.
   - Validaciones y manejo de errores desde `js/validation.js`.
   - Manipulacion del DOM desde `js/ui.js`.
   - Uso de `try/catch` en almacenamiento, render, worker y consumo de API.

2. Dashboard y Web Worker
   - Tarjetas de metricas visibles en la parte superior del sistema.
   - Calculo de `total`, `porEstado`, `porCarrera`, `promedioGeneral`, `mayoresEdad` y `menoresEdad` desde `js/workers/student-metrics.worker.js`.

3. Almacenamiento local
   - `localStorage` guarda todos los estudiantes con la clave `students_registry_v1`.
   - `sessionStorage` guarda filtros y borradores con las claves `students_filters_v1` y `students_form_draft_v1`.

4. Consumo de API REST moderna
   - Uso de `fetch` en `js/api.js`.
   - Geolocalizacion con `navigator.geolocation`.
   - Respuesta JSON del servicio de reverse geocoding.
   - La ubicacion obtenida se muestra en el dashboard y en la tabla.

## Funcionalidades principales

- CRUD completo de estudiantes
- Busqueda por carnet, nombres o apellidos
- Filtro por carrera y estado
- Borrador automatico del formulario
- Datos de ejemplo para presentacion
- Panel lateral con resumen por carrera
- Captura de ubicacion con fallback manual
- Interfaz responsive para movil y escritorio

## Campos del modelo Student

- `id`
- `carnet`
- `nombres`
- `apellidos`
- `edad`
- `telefono`
- `direccion`
- `encargado`
- `correoInstitucional`
- `carrera`
- `ciclo`
- `promedio`
- `estado`
- `fechaRegistro`
- `latitud`
- `longitud`
- `ubicacionTexto`

## Como ejecutar localmente

Este proyecto no necesita instalar dependencias ni ejecutar comandos de `npm`. Es una aplicacion estatica hecha con `HTML`, `CSS` y `JavaScript`.

### Requisitos

- Tener `Git` instalado para clonar el repositorio.
- Tener un navegador actualizado, por ejemplo Chrome, Edge o Firefox.
- Tener conexion a internet.

La conexion a internet es necesaria porque el proyecto carga recursos externos por CDN, como Bootstrap, la fuente Manrope, el mapa y el servicio de ubicacion. Si no hay internet, algunas partes visuales o de geolocalizacion pueden fallar o mostrarse incompletas.

### Descargar el proyecto

```bash
git clone https://github.com/ga22038/App_Estudiantes.git
cd App_Estudiantes
```

### Opcion recomendada: Visual Studio Code con Live Server

1. Abre la carpeta `App_Estudiantes` en Visual Studio Code.
2. Instala la extension `Live Server`.
3. Da clic derecho sobre `index.html`.
4. Selecciona `Open with Live Server`.
5. Se abrira el proyecto en el navegador.

### Opcion rapida: abrir el archivo directamente

Tambien puedes abrir `index.html` directamente en el navegador. Esta opcion sirve para revisar la interfaz, pero para probar mejor la geolocalizacion se recomienda usar Live Server o la version publicada en Vercel.

### Version publicada

```text
https://app-estudiantes-ga22038.vercel.app
```

## Despliegue en Vercel

El proyecto puede desplegarse como sitio estatico sin backend.

1. Sube el repositorio a GitHub.
2. Importa el repo en Vercel.
3. Vercel detectara que es un sitio estatico y publicara `index.html`.
4. Usa la URL HTTPS publicada por Vercel para probar geolocalizacion real.

## Checklist de pruebas sugeridas

- Crear un estudiante valido y recargar la pagina.
- Intentar guardar con campos vacios.
- Probar correo invalido, promedio fuera de rango y carnet repetido.
- Editar un estudiante y confirmar cambios en tabla y dashboard.
- Eliminar un estudiante y validar metricas.
- Aplicar filtros, recargar la pagina y confirmar recuperacion.
- Ejecutar geolocalizacion permitida y denegada.
- Cargar datos de ejemplo y revisar el resumen por carrera.

## Notas finales

- El proyecto cumple la restriccion de no usar backend ni base de datos.
- Toda la informacion vive en el navegador del usuario.
- Antes de entregar, actualiza la seccion de integrantes con los datos reales del grupo.
