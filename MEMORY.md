# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v1.6 funcionando: Estadísticas de tiempo por tema agrupadas por mes y semana con navegación temporal (`specs/004-topic-time-stats/`).
- Disposición en 3 columnas en escritorio (Panel mensual | Objetivo semanal | Panel semanal) y responsive apilado en móvil.
- Edición y eliminación de sesiones pasadas con formulario en línea (`specs/003-edit-delete-sessions/`).
- Objetivo semanal de estudio con barra de progreso y edición (`specs/002-weekly-goal/`).
- Mapa de calor de 12 semanas (lunes a domingo, 5 intensidades).
- Métricas triples de racha (actual, mejor, este mes) y registro de sesiones en localStorage.
- 70 tests unitarios nativos pasando en verde con `node --test` (42 en `topic-stats.test.js`, 15 en `goal.test.js`, 13 en `heatmap.test.js`).

## Decisiones (y por qué)
- Normalización flexible de temas (`normalizeTopic`): convierte a minúsculas, remueve diacríticos (`NFD`), reemplaza guiones por espacios y colapsa espacios. Permite agrupar "Inglés", "ingles", "INGLÉS" o variantes con guiones en un único concepto.
- Formato de visualización con `toTitleCase`: divide por espacios para no tratar letras acentuadas tras diacríticos como límites de palabra (`\b\w` en regex falla con Unicode).
- Layout de 3 columnas en `stats-row` con `max-width: 960px` en `body`: integra armoniosamente el objetivo semanal y los dos paneles de estadísticas.
- Scroll interno en la lista de temas (`max-height: 220px` y `overflow-y: auto`) para mantener la tarjeta compacta independientemente del número de temas.

## Aprendizajes y errores a evitar
- Unicode en `toTitleCase`: nunca usar `\b\w` con regex simple para mayúsculas porque considera caracteres acentuados como `é` fuera del límite de palabra (ej. `IngléS`).
- Fechas locales estrictas: cálculo de semanas lunes a domingo usando fechas locales con mediodía (`12:00`) para evitar desfases de DST.
- Viewport en MCP: verificar responsividad probando explícitamente en escritorio (≥960px) y móvil (375px).

## Próximos pasos y notas técnicas
- Funcionalidad verificada con Chrome DevTools MCP en escritorio y móvil (375px) sin errores de consola.
- Todas las tareas de `specs/004-topic-time-stats/tasks.md` completadas.