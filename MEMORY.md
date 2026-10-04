# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v1.2 funcionando: registrar sesiones, historial ordenado y visualización triple de racha actual (🔥), mejor racha histórica (🏆) y días estudiados en el mes en curso (📅).
- Creada la constitución del proyecto en `docs/constitution.md` con sus 6 principios innegociables.
- Convención de commits atómicos por tipo añadida a `AGENTS.md`.
- Datos en localStorage (clave `diario-estudio-sesiones`, con retrocompatibilidad).
- Skill local activada: `.agents/skills/local-dates/` para manejo riguroso de fechas locales.

## Decisiones (y por qué)
- Constitución establecida en `docs/constitution.md`: simplicidad primero, la spec manda, funciones puras aisladas del DOM/storage con parámetro "hoy", tests nativos con `node --test`, respeto absoluto de datos/fechas locales e idioma (código en inglés, interfaz/docs en español).
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic (`file://`).
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Cálculo dinámico de la mejor racha: se calcula a partir de las sesiones guardadas en vez de guardar un valor independiente, evitando inconsistencias si se modifican datos en el futuro.
- Manejo de fechas a las 12:00 local: al crear objetos `Date` intermedios para sumar/restar días, fijar las 12:00 evita saltos por cambios de horario estacional (DST).

## Aprendizajes y errores a evitar
- Nunca usar `toISOString()` ni `new Date("AAAA-MM-DD")` porque usan UTC y desfasan el día. Usar siempre componentes locales (`getFullYear()`, etc.).

## Próximos pasos y notas técnicas
- Pruebas E2E realizadas con Chrome DevTools: registro de 3 sesiones consecutivas (hoy, ayer, anteayer), validación de racha (3), mejor racha (3) y vista móvil (375 px) sin errores en consola.
- El servidor `chrome-devtools-mcp` (v1.10.1) funciona directamente vía `npx` y lanza la instancia local de Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`).