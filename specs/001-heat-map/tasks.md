# Tareas de Implementación: Mapa de Calor (001-heat-map)

Este documento desglosa la implementación en tareas pequeñas (20-30 min), ordenadas por dependencia para asegurar que la lógica pura se consolida antes de interactuar con el DOM.

### Fase 1: Lógica Pura y Tests (Infraestructura `node --test`)

- [x] **Tarea 1.1: Setup de lógica pura y pruebas**
  - Crear `heatmap.js` y el directorio/archivo `tests/heatmap.test.js`.
  - Configurar la exportación condicional para Node (`if (typeof module !== 'undefined') module.exports = {...}`).
  - Escribir un test básico de comprobación (`assert.ok(true)`).
  - *Cubre:* RNF-4 (Principio 4 de la Constitución).
  - *Hecho cuando:* El comando `node --test tests/heatmap.test.js` se ejecuta exitosamente en consola.

- [x] **Tarea 1.2: Funciones auxiliares (Niveles y Fechas)**
  - Implementar `calculateLevel(minutes)` (umbrales fijos 0, 1-29, etc).
  - Implementar `getStartDate(today)` (retorna la fecha local del lunes de hace 11 semanas).
  - Implementar `formatDisplayDate(dateStr)` (retorna string "Lunes, 4 de mayo de 2026").
  - Añadir tests unitarios exhaustivos para cada función.
  - *Cubre:* RF-1.1, RF-1.2, RF-3.
  - *Hecho cuando:* Los tests unitarios confirman que los niveles son precisos y que el lunes base se calcula bien incluso cambiando de mes/año o en años bisiestos.

- [x] **Tarea 1.3: Función central `generateHeatmapData` (Dimensiones y Días futuros)**
  - Implementar el bucle iterativo de 84 días (12 semanas × 7 filas).
  - Comprobar la bandera `isFuture` para cada celda en base al `today` inyectado.
  - Escribir tests inyectando "hoy" como lunes (6 días futuros) y "hoy" como domingo (0 días futuros).
  - *Cubre:* RF-1.2, RF-1.3, RF-1.4.
  - *Hecho cuando:* La función retorna un array plano de 84 elementos y los tests validan que los últimos `isFuture` son exactos según el día de la semana inyectado.

- [x] **Tarea 1.4: Función central (Agregación de sesiones y Casos límite)**
  - Modificar `generateHeatmapData` para procesar el array de sesiones, sumar los minutos por día (manejando strings, nulos o negativos como 0).
  - Ignorar explícitamente sesiones con fecha futura o previas a la semana 1.
  - Escribir tests con múltiples sesiones el mismo día y sesiones inválidas.
  - *Cubre:* RF-2.1, RF-2.2, RF-2.3, RF-2.4.
  - *Hecho cuando:* Los tests aseguran que un día con 3 sesiones suma el total de minutos y obtiene el nivel de color adecuado, ignorando correctamente la "basura".

---

### Fase 2: Interfaz Visual (HTML/CSS)

- [x] **Tarea 2.1: Estructura HTML y enlace de scripts**
  - Añadir en `index.html` el `<script src="heatmap.js"></script>` ANTES de `app.js`.
  - Crear el contenedor principal para el mapa de calor (`div#heatmap-wrapper`).
  - Crear dentro el div de la cuadrícula (`div#heatmap-grid`) y el panel de detalle (`div#heatmap-info`).
  - *Cubre:* HU-1, HU-3.
  - *Hecho cuando:* Los contenedores están en el DOM en la posición correcta (ej. debajo de las estadísticas) sin romper la maqueta existente.

- [x] **Tarea 2.2: Estilos base y Grid CSS**
  - Modificar `styles.css` añadiendo el display grid al contenedor: `grid-auto-flow: column`, `grid-template-rows: repeat(7, 1fr)`.
  - Definir las clases de color para los niveles (`.level-0` a `.level-4`).
  - Definir la clase `.hidden-future` con `visibility: hidden`.
  - Garantizar scroll horizontal suave para pantallas móviles.
  - *Cubre:* RF-3, RNF-1, RNF-2.
  - *Hecho cuando:* Inyectando manualmente 84 `div` mockeados en el HTML desde DevTools, el mapa se ve como una cuadrícula perfecta de 12x7, los colores contrastan y hace scroll en 375px.

---

### Fase 3: Integración en la Aplicación y Eventos

- [x] **Tarea 3.1: Renderizado dinámico en app.js**
  - Integrar la llamada a `generateHeatmapData(sessions, new Date())` dentro de `updateUI()` en `app.js`.
  - Vaciar `div#heatmap-grid` y rellenarlo iterando el array, creando divs con clases `level-X`, `hidden-future` (si aplica) y atributos `data-date`, `data-display`, `data-minutes`.
  - *Cubre:* RF-5.
  - *Hecho cuando:* Al añadir una nueva sesión manual en el formulario, la cuadrícula se repinta al instante reflejando el cambio de color real en la celda del día de hoy.

- [x] **Tarea 3.2: Interactividad del panel de detalle**
  - Implementar *Event Delegation* en `div#heatmap-grid` capturando eventos de ratón/toque.
  - Al interactuar sobre una celda activa, extraer su `dataset` e inyectar el texto en `div#heatmap-info`.
  - Configurar el mensaje por defecto ("Hoy (...): X minutos") cuando se saca el ratón de la cuadrícula.
  - *Cubre:* RF-4.1, RF-4.2, RF-4.3, RF-4.4.
  - *Hecho cuando:* Interactuar con diferentes celdas actualiza el panel de forma fluida tanto en PC como en simulación táctil (DevTools), mostrando siempre el texto correcto en español.
