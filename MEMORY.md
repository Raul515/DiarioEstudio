# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v1.4 funcionando: Objetivo semanal de estudio con barra de progreso, persistencia y edición interactiva (`specs/002-weekly-goal/`).
- Mapa de calor de 12 semanas (lunes a domingo, 5 niveles de intensidad y panel informativo unificado para móvil/escritorio).
- Sistema de registro de sesiones, historial ordenado y métricas triples de rachas (actual, mejor, este mes).
- 28 tests unitarios nativos pasando en verde con `node --test` (15 para `goal.js` y 13 para `heatmap.js`).

## Decisiones (y por qué)
- Constitución establecida en `docs/constitution.md`: simplicidad primero, la spec manda, funciones puras aisladas del DOM/storage con parámetro "hoy", tests nativos con `node --test`, respeto absoluto de datos/fechas locales e idioma (código en inglés, interfaz/docs en español).
- `goal.js` para lógica pura de objetivos: desacoplado de DOM/storage, testeable con `node --test` nativo y compatible con `file://`.
- Clave de persistencia independiente `diario-estudio-meta-semanal` en localStorage: salvaguarda la retrocompatibilidad y pureza de `diario-estudio-sesiones`.
- Semana de lunes a domingo: coherencia perceptual absoluta con la orientación del mapa de calor (`heatmap.js`).
- CSS Grid con `grid-auto-flow: column; grid-template-rows: repeat(7, 18px);` para el mapa de calor.

## Aprendizajes y errores a evitar
- Nunca usar `toISOString()` ni `new Date("AAAA-MM-DD")` porque usan UTC y desfasan el día. Usar siempre componentes locales (`getFullYear()`, etc.).
- Manejo de fechas intermedias a las 12:00 local para evitar saltos por cambios estacionales (DST).

## Próximos pasos y notas técnicas
- Objetivo semanal y mapa de calor completamente verificados en móvil (375 px) y escritorio con Chrome DevTools MCP sin errores de consola.
- Todas las tareas de `specs/002-weekly-goal/tasks.md` completadas.
- Agentes Antigravity en `.agents/agents/`: `coordinator.md`, `planner.md`, `implementer.md`, `reviewer.md`.