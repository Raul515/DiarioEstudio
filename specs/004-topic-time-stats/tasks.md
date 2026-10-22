# Tareas: Estadísticas de Tiempo por Tema (004-topic-time-stats)

## Fase 1: Lógica pura (`topic-stats.js`)
1. [x] Crear `topic-stats.js` con las funciones puras:
   - `normalizeTopic(name)`: normaliza nombre para agrupación (minúsculas, sin diacríticos, sin guiones, colapsa espacios).
   - `toTitleCase(name)`: convierte texto a Title Case (primera letra de cada palabra en mayúscula).
   - `formatDuration(minutes)`: devuelve `"X min"` si < 60, o `"Xh Ymin"` si ≥ 60.
   - `getWeekRangeForOffset(today, offset)`: devuelve `{ startStr, endStr, label }` de la semana correspondiente (lunes a domingo).
   - `getMonthRangeForOffset(today, offset)`: devuelve `{ startStr, endStr, label }` del mes correspondiente.
   - `buildTopicRanking(sessions, startStr, endStr)`: filtra, agrupa, suma, ordena y devuelve `{ topics: [{ displayName, totalMinutes, percentage }], totalMinutes }`.
   - Exportación condicional con `module.exports` para tests.

## Fase 2: Tests (`tests/topic-stats.test.js`)
2. [x] Crear `tests/topic-stats.test.js` con tests unitarios usando `node --test`:
   - `normalizeTopic`: equivalencias documentadas en CA 4.2 (casing, tildes, guiones, espacios).
   - `toTitleCase`: palabras simples, compuestas, con diacríticos.
   - `formatDuration`: menos de 60, exactamente 60, más de 60, minutos a 0 en la hora.
   - `getWeekRangeForOffset`: offset 0, -1, +1; que el lunes y domingo sean correctos.
   - `getMonthRangeForOffset`: offset 0, -1, +1; que inicio y fin del mes sean correctos.
   - `buildTopicRanking`: agrupación con temas duplicados normalizados, orden descendente, porcentajes, total, sin sesiones.
3. [x] Ejecutar `node --test` y verificar que todos pasan en verde.

## Fase 3: Estilos (`styles.css`)
4. [x] Añadir en `styles.css` los estilos para:
   - `.stats-row`: grid de 3 columnas con gap, `align-items: start`.
   - `.topic-stats-panel`: apariencia de tarjeta coherente con el diseño actual.
   - `.topic-stats-header`: flexbox con flechas de navegación y título centrado.
   - `.topic-stats-nav`: estilos de los botones de flecha.
   - `.topic-stats-total`: texto del total agregado.
   - `.topic-stats-list`: `max-height` + `overflow-y: auto` para scroll interno.
   - `.topic-stats-item`: layout de cada fila del ranking (nombre, barra, tiempo).
   - `.topic-stats-bar-wrap` y `.topic-stats-bar`: barra de proporción horizontal.
   - `.topic-stats-empty`: mensaje de "Sin sesiones".
   - Media query `<= 768px`: `.stats-row` a 1 columna.

## Fase 4: HTML (`index.html`)
5. [x] Modificar `index.html`:
   - Envolver la sección `weekly-goal-section` en un `<div class="stats-row">`.
   - Añadir antes del objetivo semanal la estructura del panel mensual (`id="topic-stats-monthly"`).
   - Añadir después del objetivo semanal la estructura del panel semanal (`id="topic-stats-weekly"`).
   - Añadir `<script src="topic-stats.js"></script>` antes de `app.js`.

## Fase 5: Integración en `app.js`
6. [x] En `app.js`, añadir las variables de estado de navegación (`weeklyStatsOffset`, `monthlyStatsOffset`) y las referencias al DOM de los nuevos paneles.
7. [x] Crear `renderTopicStats()`: invoca las funciones puras de `topic-stats.js` con los offsets actuales y renderiza ambos paneles en el DOM.
8. [x] Crear `setupTopicStatsEvents()`: conecta los botones de navegación (◀ ▶) para cambiar los offsets y rellamar a `renderTopicStats()`.
9. [x] Añadir `renderTopicStats()` dentro de `updateUI()` y llamar a `setupTopicStatsEvents()` desde `init()`.

## Fase 6: Verificación y cierre
10. [x] Cargar `index.html` en Chrome DevTools (MCP) y verificar el layout de 3 columnas en escritorio.
11. [x] Verificar vista móvil (375px): los paneles se apilan correctamente.
12. [x] Probar navegación temporal: avanzar/retroceder semana y mes, comprobar que el ranking se actualiza.
13. [x] Probar normalización con sesiones que tengan variantes del mismo tema.
14. [x] Verificar scroll interno con muchos temas.
15. [x] Verificar que no hay errores en la consola.
16. [x] Actualizar `MEMORY.md` con los cambios implementados.
