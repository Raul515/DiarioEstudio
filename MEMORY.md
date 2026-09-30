# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v1.1 funcionando: registrar sesiones (fecha, tema, minutos), historial ordenado y visualización dual de racha actual (🔥) y mejor racha histórica (🏆).
- Datos en localStorage (clave `diario-estudio-sesiones`, con retrocompatibilidad).
- Documentación completa: `README.md`, `AGENTS.md` y `MEMORY.md` sincronizados y concisos.

## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic (`file://`).
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Cálculo dinámico de la mejor racha: se calcula a partir de las sesiones guardadas en vez de guardar un valor independiente, evitando inconsistencias si se modifican datos en el futuro.
- Manejo de fechas a las 12:00 local: al crear objetos `Date` intermedios para sumar/restar días, fijar las 12:00 evita saltos por cambios de horario estacional (DST).

## Aprendizajes y errores a evitar
- Nunca usar `toISOString()` ni `new Date("AAAA-MM-DD")` porque usan UTC y desfasan el día. Usar siempre componentes locales (`getFullYear()`, etc.).

## Próximos pasos
- (vacío por ahora)