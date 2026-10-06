# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v1.5 funcionando: Edición (solo tema y minutos, fecha inmutable) y eliminación de sesiones pasadas con formulario en línea y confirmación (`specs/003-edit-delete-sessions/`).
- Objetivo semanal de estudio con barra de progreso, persistencia y edición interactiva (`specs/002-weekly-goal/`).
- Mapa de calor de 12 semanas (lunes a domingo, 5 niveles de intensidad y panel informativo unificado).
- Sistema de registro de sesiones, historial ordenado y métricas triples de rachas (actual, mejor, este mes).
- 28 tests unitarios nativos pasando en verde con `node --test` (15 para `goal.js` y 13 para `heatmap.js`).

## Decisiones (y por qué)
- Edición y eliminación sin cambiar fechas: protege la integridad cronológica de rachas y mapas de calor.
- Migración de IDs retrocompatible: en `loadData()`, si una sesión carece de `id`, se le asigna uno único y se persiste en `localStorage` sin pérdida de datos.
- Delegación de eventos en `sessionsContainer`: optimiza el rendimiento del DOM ante muchas sesiones.
- In-line form con validación HTML5 para editar tema y minutos.
- Constitución establecida en `docs/constitution.md`: simplicidad primero, funciones puras con parámetro "hoy", tests nativos con `node --test`, datos/fechas locales sagrados e idioma (código en inglés, interfaz/docs en español).
- Clave de persistencia independiente `diario-estudio-meta-semanal` en localStorage.

## Aprendizajes y errores a evitar
- Nunca usar `toISOString()` ni `new Date("AAAA-MM-DD")` porque usan UTC y desfasan el día. Usar siempre componentes locales.
- Manejo de fechas intermedias a las 12:00 local para evitar saltos por DST.
- Asegurar atributos `name` e `id` en inputs dinámicos para evitar avisos de accesibilidad.

## Próximos pasos y notas técnicas
- Funcionalidad de edición/eliminación verificada en móvil (375 px) y escritorio con Chrome DevTools MCP sin errores de consola.
- Todas las tareas de `specs/003-edit-delete-sessions/tasks.md` completadas.