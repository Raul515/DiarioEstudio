# Tareas: Agrupación de Temas con Paréntesis y Expander de Subtemas (005-topic-subtopics-parentheses)

- [x] **Tarea 1 (Lógica y Tests)**: Implementar `parseTopic` y actualizar `buildTopicRanking` con soporte de subtemas en `topic-stats.js` junto a sus tests unitarios en `tests/topic-stats.test.js`.
  - Criterio de aceptación:
    - `parseTopic` separa adecuadamente base y subtema de paréntesis al final, maneja casos límite (vacío, solo paréntesis).
    - `buildTopicRanking` agrupa por tema base, calcula minutos totales y genera la lista `subtopics` ordenada con porcentajes relativos.
    - `node --test` pasa en verde con todos los tests nuevos y existentes (cero regresiones).
  - Commit: `feat(logic): funciones puras para parseo de subtemas y agrupacion por tema base`

- [x] **Tarea 2 (Interfaz de Usuario)**: Actualizar la renderización de paneles en `app.js` usando `<details>` y `<summary>` para temas con múltiples subtemas.
  - Criterio de aceptación:
    - Los temas con 2 o más subtemas se renderizan como `<details class="topic-stats-item has-subtopics">`.
    - La vista interna desglosa cada subtema con nombre, tiempo formateado y mini-barra de porcentaje.
    - Los temas simples (<= 1 subtema) se renderizan como filas normales sin expander.
  - Commit: `feat(ui): expander interactivo para subtemas en paneles de estadisticas`

- [x] **Tarea 3 (Estilos y Responsive)**: Añadir los estilos visuales en `styles.css` para el desplegable, rotación del chevron, indentación y mini-barras en escritorio y móvil.
  - Criterio de aceptación:
    - El expander tiene cursor pointer, elimina el marcador nativo del navegador y muestra una flecha `▸` que rota 90° al abrirse.
    - Los subtemas tienen jerarquía visual secundaria limpia con línea guía lateral y barras proporcionales.
    - Se ve correctamente en móvil (375px) sin desbordamientos.
  - Commit: `style: estilos para expander de subtemas y mini barras en paneles de estadisticas`

- [x] **Tarea 4 (Verificación y Memoria)**: Verificar visualmente en navegador con Chrome DevTools MCP en escritorio y móvil, comprobar consola limpia y actualizar `MEMORY.md`.
  - Criterio de aceptación:
    - Verificación con sesiones de prueba (incluyendo los casos de las capturas).
    - Cero errores en consola.
    - `MEMORY.md` actualizado con el estado v1.7.
  - Commit: `docs(memory): actualizar memoria con spec 005 y estado v1.7`
