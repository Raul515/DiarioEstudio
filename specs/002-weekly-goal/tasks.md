# Tareas de Implementación: Objetivo Semanal de Estudio (002-weekly-goal)

Este documento desglosa la implementación en 6 tareas secuenciales e independientes, garantizando TDD (tests primero en la lógica pura) antes de interactuar con el DOM.

---

### Fase 1: Lógica Pura y Tests Unitarios (`node --test`)

- [x] **Tarea 1: Setup y funciones de rango semanal (`goal.js` y `tests/goal.test.js`)**
  - Crear `goal.js` con exportación condicional para Node (`if (typeof module !== 'undefined' && module.exports) module.exports = { ... }`).
  - Implementar función pura `getWeekRange(today)` (calcula el lunes 00:00 y domingo 23:59 de la semana local en curso).
  - Implementar función pura `validateGoalInput(inputValue)` (valida número entero > 0 y <= 10080).
  - Crear `tests/goal.test.js` con pruebas unitarias que cubran diferentes días de la semana (lunes, miércoles, domingo) y casos válidos e inválidos de validación.
  - *Cubre:* RF-1.1, RF-1.2, RF-2.3.
  - *Hecho cuando:* `node --test tests/goal.test.js` se ejecuta y pasa en verde.

- [x] **Tarea 2: Función de cálculo de progreso semanal (`goal.js`)**
  - Implementar función pura `calculateWeeklyProgress(sessions, goalMinutes, today)`.
  - Sumarizar minutos de sesiones dentro del rango de la semana en curso (con `date <= todayStr`).
  - Tratar defensivamente minutos inválidos o nulos como 0.
  - Calcular porcentaje redondeado (`Math.round((current / goal) * 100)`), `isCompleted`, minutos restantes y minutos extra.
  - Extender `tests/goal.test.js` con casos de prueba para semana sin sesiones, múltiples sesiones el mismo día, sesiones fuera de rango, fechas futuras en la semana, 100% exacto y superación de meta.
  - *Cubre:* RF-1.3, RF-2.1, RF-2.4, RF-3.1, RF-3.2, RF-3.3.
  - *Hecho cuando:* Todos los tests unitarios pasan en verde sin fallos.

---

### Fase 2: Marcado y Estilos Visuales (HTML/CSS)

- [x] **Tarea 3: Estructura HTML y enlace de scripts (`index.html`)**
  - Añadir `<script src="goal.js"></script>` en `index.html` antes de `app.js`.
  - Maquetar el contenedor `#weekly-goal-card` entre la sección de métricas (`.metrics`) y el mapa de calor (`#heatmap-container`).
  - Incluir cabecera con título y botón de edición, contenedor de barra de progreso (`.goal-progress-track`, `.goal-progress-fill`), textos informativos y formulario de edición (input numérico, botón guardar, botón cancelar y mensaje de error) oculto inicialmente.
  - *Cubre:* RF-4.1.
  - *Hecho cuando:* El contenedor está insertado en el DOM semánticamente sin alterar la disposición del resto de la página.

- [x] **Tarea 4: Estilos CSS y diseño responsive (`styles.css`)**
  - Definir estilos de la tarjeta `#weekly-goal-card` acorde a la paleta y estética actual.
  - Estilizar la barra de progreso (track de fondo sutil y relleno con transición fluida).
  - Definir la clase `.goal-completed` para destacar la meta cumplida (acento verde/dorado y distintivo de felicitación).
  - Asegurar maquetación responsive limpia en pantallas móviles (375 px) y controles táctiles cómodos.
  - *Cubre:* RF-3.2, RF-3.3, RF-4.2.
  - *Hecho cuando:* La tarjeta luce integrada estéticamente y se adapta sin desbordamientos horizontales en vista móvil de 375 px.

---

### Fase 3: Integración, Persistencia e Interacción (`app.js`)

- [x] **Tarea 5: Persistencia y renderizado dinámico (`app.js`)**
  - Declarar constante `STORAGE_KEY_GOAL = 'diario-estudio-meta-semanal'`.
  - Crear `loadGoal()` (con fallback a 300 minutos) y `saveGoal(minutes)`.
  - Crear `renderWeeklyGoal()` que invoque `calculateWeeklyProgress(sessions, goalMinutes, new Date())` y actualice el DOM (barra, textos, porcentaje y clases de estado).
  - Conectar `renderWeeklyGoal()` en el flujo de arranque de la aplicación y en `updateUI()`.
  - *Cubre:* RF-1.3, RF-2.1, RF-2.2, RF-3.
  - *Hecho cuando:* Al registrar o borrar sesiones el progreso semanal se actualiza automáticamente y la meta se recupera tras recargar.

- [x] **Tarea 6: Interacción de edición y validación en interfaz (`app.js`)**
  - Manejar apertura y cierre del formulario de edición (botones Editar y Cancelar).
  - Al hacer clic en Guardar, validar la entrada con `validateGoalInput`. Si es válida, guardar con `saveGoal`, actualizar la vista y cerrar el formulario; si es inválida, mostrar mensaje de error en la UI sin modificar el estado previo.
  - Actualizar `MEMORY.md` al finalizar la spec.
  - *Cubre:* RF-2.2, RF-2.3.
  - *Hecho cuando:* El usuario puede modificar su meta semanal, se previenen valores erróneos con mensajes claros y el nuevo objetivo se refleja de inmediato.
