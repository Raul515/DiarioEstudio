# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v1.3 funcionando: mapa de calor de 12 semanas (estilo GitHub, lunes a domingo, 5 niveles de intensidad y panel informativo unificado para móvil/escritorio).
- Sistema de registro de sesiones, historial ordenado y métricas triples de rachas (actual, mejor, este mes).
- Constitución (`docs/constitution.md`), spec funcional (`specs/001-heat-map/spec.md`) y plan completado.
- 13 tests unitarios nativos pasando en verde con `node --test`.

## Decisiones (y por qué)
- Constitución establecida en `docs/constitution.md`: simplicidad primero, la spec manda, funciones puras aisladas del DOM/storage con parámetro "hoy", tests nativos con `node --test`, respeto absoluto de datos/fechas locales e idioma (código en inglés, interfaz/docs en español).
- `heatmap.js` para lógica pura: desacoplado del DOM con exportación condicional para Node (`node --test`), permitiendo pruebas unitarias deterministas sin romper la ejecución directa con doble clic (`file://`).
- CSS Grid con `grid-auto-flow: column; grid-template-rows: repeat(7, 18px);`: organiza limpiamente 12 columnas x 7 filas.
- Días futuros de la semana en curso con `visibility: hidden`: preserva la alineación vertical de los días sin renderizar fechas inexistentes ni romper la proporción de la cuadrícula.
- Panel informativo fijo contiguo: evita popups o tooltips flotantes que fallan en pantallas táctiles.

## Aprendizajes y errores a evitar
- Nunca usar `toISOString()` ni `new Date("AAAA-MM-DD")` porque usan UTC y desfasan el día. Usar siempre componentes locales (`getFullYear()`, etc.).
- Manejo de fechas intermedias a las 12:00 local para evitar saltos por cambios estacionales (DST).

## Próximos pasos y notas técnicas
- Mapa de calor completamente verificado en móvil (375 px) y escritorio con Chrome DevTools MCP.
- Todas las tareas de `specs/001-heat-map/tasks.md` marcadas como completadas.