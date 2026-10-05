# Plan Técnico: Objetivo Semanal de Estudio (002-weekly-goal)

Este documento detalla la arquitectura e implementación de la funcionalidad `002-weekly-goal`, en estricta conformidad con `docs/constitution.md` y `AGENTS.md`.

## 1. Archivos afectados y responsabilidades

- **`goal.js` (NUEVO)**
  - *Responsabilidad*: Módulo de lógica pura (sin referencias a DOM ni a `localStorage`). Calcula el rango de la semana local, agrega los minutos de estudio válidos, evalúa porcentajes y valida valores de meta. Compatible con navegador directo (`file://`) y exportación condicional para Node (`node --test`).
  - *Cobertura*: RF-1, RF-2.1, RF-2.3, RF-2.4, RF-3.
- **`tests/goal.test.js` (NUEVO)**
  - *Responsabilidad*: Batería de pruebas unitarias exhaustivas con `node --test` nativo verificando la lógica matemática y temporal antes de tocar la interfaz visual.
  - *Cobertura*: Principio 4 de la Constitución.
- **`index.html` (Modificar)**
  - *Responsabilidad*: Cargar el script `goal.js` antes de `app.js` e incorporar el marcado HTML semántico de la tarjeta del objetivo semanal entre la sección de métricas de racha y el mapa de calor.
  - *Cobertura*: RF-3, RF-4.1.
- **`styles.css` (Modificar)**
  - *Responsabilidad*: Estilos del widget del objetivo semanal: tarjeta contenedora, barra de progreso con gradiente/relleno proporcional, estilos diferenciados de éxito (>= 100%), formulario de edición compacto y adaptación responsive móvil (375 px).
  - *Cobertura*: RF-3, RF-4.2.
- **`app.js` (Modificar)**
  - *Responsabilidad*: Orquestación de UI y persistencia: lectura y escritura de la clave `diario-estudio-meta-semanal` en `localStorage`, actualización reactiva al añadir/eliminar sesiones y control del modo edición interactivo.
  - *Cobertura*: RF-1.3, RF-2.2, RF-3, RF-4.

---

## 2. Funciones puras de lógica (`goal.js`)

1. **`getWeekRange(today)`**
   - *Entrada*: `today` (`Date`).
   - *Salida*: `{ startStr: "AAAA-MM-DD", endStr: "AAAA-MM-DD" }` (desde el lunes 00:00 hasta el domingo de la semana local).
   - *Regla*: Usa componentes locales (`getFullYear()`, etc.) y horas intermedias (12:00) para evitar saltos DST.

2. **`calculateWeeklyProgress(sessions, goalMinutes, today)`**
   - *Entrada*: `sessions` (Array de `{date, minutes}`), `goalMinutes` (Number), `today` (`Date`).
   - *Salida*:
     ```js
     {
       currentMinutes: Number,       // Suma de minutos válidos en la semana actual (date <= todayStr)
       goalMinutes: Number,          // Meta efectiva
       percentage: Number,           // Entero redondeado (ej. 75, 120)
       isCompleted: Boolean,         // currentMinutes >= goalMinutes
       remainingMinutes: Number,     // Math.max(0, goalMinutes - currentMinutes)
       extraMinutes: Number,         // Math.max(0, currentMinutes - goalMinutes)
       weekRange: { startStr, endStr }
     }
     ```

3. **`validateGoalInput(inputValue)`**
   - *Entrada*: Valor introducido por el usuario (string o number).
   - *Salida*: `{ valid: Boolean, minutes: Number|null, error: String|null }`.
   - *Regla*: Entero positivo, > 0 y <= 10080 minutos.

---

## 3. Decisiones técnicas y alternativas descartadas

1. **Módulo dedicado `goal.js` frente a incluirlo en `app.js`**:
   - *Decisión*: Crear `goal.js` con exportación condicional para Node.
   - *Por qué*: Cumple el Principio 3 (separación de lógica e interfaz) y Principio 4 (tests aislados con `node --test`).
   - *Alternativa descartada*: Mezclar el cálculo en `app.js`, lo que impediría ejecutar tests automáticos sin dependencias de emulación DOM.

2. **Persistencia en clave dedicada `diario-estudio-meta-semanal`**:
   - *Decisión*: Usar una clave aislada en `localStorage`.
   - *Por qué*: Cumple el Principio 5 ("Los datos del usuario son sagrados"). No modifica el formato de `diario-estudio-sesiones` garantizando retrocompatibilidad absoluta.
   - *Alternativa descartada*: Añadir un objeto envoltorio que combine sesiones y configuración en la misma clave, lo que pondría en riesgo el historial previo de los usuarios.

3. **Delimitación de la semana (Lunes a Domingo)**:
   - *Decisión*: Lunes como primer día de la semana.
   - *Por qué*: Es idéntico al estándar ISO utilizado por el mapa de calor (`heatmap.js`), ofreciendo coherencia perceptual inmediata al usuario.
   - *Alternativa descartada*: Ventana rodante de 7 días, que no se ajustaría al concepto natural de "meta semanal".

---

## 4. Estrategia de pruebas (`tests/goal.test.js`)

Se crearán tests unitarios con `node --test` nativo cubriendo:
1. `getWeekRange`: cálculo correcto en lunes, mitad de semana y domingo.
2. `calculateWeeklyProgress`:
   - Semana sin sesiones (0 minutos, 0%).
   - Sesiones distribuidas en la semana (agregación correcta).
   - Descarte de sesiones de semanas anteriores o posteriores.
   - Descarte de sesiones con fechas futuras dentro de la misma semana.
   - Robustez ante minutos negativos, nulos o cadenas inválidas.
   - Cumplimiento exacto (100%) y superación (> 100%).
3. `validateGoalInput`:
   - Valores válidos (ej. 300, 60, 10080).
   - Rechazo de números negativos, 0, decimales, textos no numéricos o valores desorbitados (> 10080).
