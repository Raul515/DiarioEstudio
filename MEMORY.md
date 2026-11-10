# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v1.7 funcionando: Agrupación de temas por nombre base ignorando especificaciones en paréntesis y expander interactivo de subtemas para paneles semanal y mensual (`specs/005-topic-subtopics-parentheses/`).
- Paneles semanal y mensual en 3 columnas junto al objetivo semanal y mapa de calor de 12 semanas.
- Edición y eliminación de sesiones pasadas con formulario en línea (`specs/003-edit-delete-sessions/`).
- Métricas triples de racha (actual, mejor, este mes) y registro de sesiones en localStorage.
- 82 tests unitarios nativos pasando en verde con `node --test` (54 en `topic-stats.test.js`, 15 en `goal.test.js`, 13 en `heatmap.test.js`).

## Decisiones (y por qué)
- Extracción de tema base y subtema con `parseTopic`: regex `/^(.*?)\s*\(([^)]*)\)\s*$/`. Agrupa "Estudiar Teoria Sistemas Distribuidos (Tema 4)" y "(Temas 3 y 5)" bajo el mismo concepto sin alterar `localStorage`.
- Componente `<details>` / `<summary>` para el expander: solución nativa HTML5, cero listeners JS para el toggle, accesible con teclado (`Enter`/`Espacio`) y lectores de pantalla.
- Subtemas: porcentaje calculado relativo al tiempo total del tema base (ej. 55m de 67m = 82%) para ver la distribución interna de la materia.
- Sesiones mixtas (con y sin paréntesis): las sesiones sin paréntesis se listan bajo la etiqueta `General` para que la suma del desglose coincida al minuto.
- Temas con <= 1 subtema: se muestran como filas estándar planas sin expander para no recargar la interfaz.
- Normalización flexible (`normalizeTopic`) y Title Case (`toTitleCase` por palabras) preservados.

## Aprendizajes y errores a evitar
- Separación de `summary` y `div` en CSS: aplicar `display: grid` al `summary` y dejar `details` como `display: block` para evitar que el navegador distorsione la lista expandida.
- Fechas locales estrictas: cálculo de semanas lunes a domingo usando fechas locales con mediodía (`12:00`) para evitar desfases de DST.
- Viewport en MCP: verificar responsividad probando explícitamente en escritorio (≥960px) y móvil (375px).

## Próximos pasos y notas técnicas
- Funcionalidad verificada con Chrome DevTools MCP en escritorio y móvil (375px) con consola 100% limpia.
- Todas las tareas de `specs/005-topic-subtopics-parentheses/tasks.md` completadas.