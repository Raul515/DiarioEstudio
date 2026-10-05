# Especificación: Objetivo Semanal de Estudio (002-weekly-goal)

**Estado**: Aprobado

## 1. Contexto y objetivo

### 1.1 Contexto
El Diario de Estudio ofrece métricas de rachas (actual y mejor) y un mapa de calor retrospectivo de 12 semanas. Sin embargo, no proporciona un mecanismo proactivo para que el usuario planifique una meta concreta de tiempo a corto plazo (semana en curso) ni mida en tiempo real su avance respecto a dicha meta.

### 1.2 Objetivo
Permitir a los usuarios definir un objetivo de estudio en minutos para la semana actual (de lunes a domingo) y monitorizar su progreso mediante una barra visual y métricas cuantitativas, incentivando la constancia y el cumplimiento semanal.

---

## 2. Usuarios

- **Estudiante / Autodidacta**: Desea tener una meta clara y alcanzable para la semana en curso y conocer de un vistazo cuántos minutos le faltan para lograrla o si ya la ha completado/superado.

---

## 3. Historias de usuario

- **HU-1 (Fijación de objetivo)**: Como estudiante, quiero poder configurar mi meta semanal de estudio en minutos (con un valor por defecto razonable) para tener un objetivo adaptado a mi disponibilidad.
- **HU-2 (Seguimiento de progreso)**: Como estudiante, quiero ver los minutos acumulados en la semana actual frente a la meta y el porcentaje completado en una barra de progreso visual para saber cuánto me falta.
- **HU-3 (Celebración de meta cumplida)**: Como estudiante, quiero que la interfaz me reconozca visualmente cuando he alcanzado o superado el 100% del objetivo para sentirme motivado.
- **HU-4 (Persistencia de la configuración)**: Como estudiante, quiero que mi meta semanal permanezca guardada entre sesiones de navegación para no tener que reconfigurarla cada vez que abro la aplicación.

---

## 4. Requisitos funcionales

### RF-1: Delimitación temporal de la semana en curso
El sistema debe calcular los minutos acumulados de estudio considerando estrictamente el rango de la semana actual de lunes a domingo.

- **Criterio de aceptación 1.1 (EARS Ubicuo)**: El sistema debe determinar el inicio de la semana como las 00:00:00 del lunes de la semana en curso y el fin de la semana como las 23:59:59 del domingo de la misma semana en la hora local del usuario.
- **Criterio de acceptance 1.2 (EARS Ubicuo)**: El cálculo del rango semanal debe recibir la fecha de referencia («hoy») como parámetro y utilizar componentes locales para evitar desfases horarios.
- **Criterio de aceptación 1.3 (EARS Evento)**: CUANDO se añada, edite o elimine una sesión, el total acumulado de la semana en curso debe recalcularse inmediatamente.

### RF-2: Configuración y persistencia del objetivo semanal
El sistema debe permitir consultar y modificar la meta semanal en minutos.

- **Criterio de aceptación 2.1 (EARS Opcional)**: DONDE el usuario no haya fijado un objetivo previo o el valor guardado esté ausente/corrupto, el sistema debe asignar un valor por defecto de 300 minutos (5 horas).
- **Criterio de aceptación 2.2 (EARS Evento)**: CUANDO el usuario pulse el botón de editar objetivo, el sistema debe mostrar un campo numérico interactivo con opciones de guardar y cancelar. Al confirmar un número entero positivo válido, el sistema debe actualizar la meta semanal y persistirla en `localStorage` bajo la clave `diario-estudio-meta-semanal`.
- **Criterio de aceptación 2.3 (EARS Excepción - Validación de entrada)**: SI el usuario intenta guardar un valor no numérico, vacío, decimal, menor o igual a 0, o superior a 10080 minutos (minutos totales en 7 días), ENTONCES el sistema debe rechazar el cambio, mantener el valor anterior y mostrar una indicación de error amigable sin alterar el estado guardado.
- **Criterio de aceptación 2.4 (EARS Excepción - Robustez de sesiones)**: SI una sesión registrada en la semana contiene minutos negativos, no numéricos o vacíos, ENTONCES el sistema debe contabilizar 0 minutos para dicho registro en la suma semanal defensivamente.

### RF-3: Cálculo y visualización del progreso
El sistema debe representar el estado del objetivo semanal en una tarjeta dedicada entre las métricas de racha y el mapa de calor.

- **Criterio de aceptación 3.1 (EARS Ubicuo)**: El sistema debe mostrar el progreso cuantitativo en formato textual: minutos estudiados en la semana / meta en minutos, junto con el porcentaje completado calculado como `Math.round((minutosActuales / meta) * 100)`.
- **Criterio de aceptación 3.2 (EARS Estado)**: MIENTRAS el porcentaje completado sea inferior al 100%, la barra de progreso debe llenar su ancho proporcionalmente de 0% a 99% e indicar los minutos restantes para alcanzar la meta.
- **Criterio de aceptación 3.3 (EARS Estado - Meta cumplida o superada)**: MIENTRAS los minutos acumulados sean iguales o superiores a la meta fijada (>= 100%), la barra de progreso debe mostrarse completa (100%), con un estilo visual distintivo de éxito (por ejemplo, color verde vibrante o icono de felicitación/trofeo) y un mensaje indicando que el objetivo ha sido cumplido (y minutos extra logrados si supera el 100%).

### RF-4: Adaptabilidad e integración visual
El componente debe integrarse armoniosamente en el diseño general de la aplicación.

- **Criterio de aceptación 4.1 (EARS Ubicuo)**: El widget de objetivo semanal debe ubicarse en una tarjeta dedicada entre las tarjetas superiores de métricas y la sección del mapa de calor.
- **Criterio de aceptación 4.2 (EARS Ubicuo)**: La tarjeta y sus controles interactivos deben ser completamente responsivos y legibles en pantallas móviles (375 px) y de escritorio.

---

## 5. Casos límite

- **Semana sin sesiones**: Si no hay sesiones registradas en la semana actual, el total acumulado es 0 minutos, el progreso es 0% y la barra está vacía.
- **Múltiples sesiones en el mismo día**: Deben sumarse todos los minutos válidos de todas las sesiones ocurridas entre el lunes y el domingo de la semana en curso.
- **Sesiones con fechas futuras en la semana**: Solo deben contabilizarse sesiones con fecha `<= hoy`.
- **Cambio de semana**: Al cambiar de semana (el lunes a las 00:00), el contador de minutos acumulados se reinicia a 0 automáticamente, manteniendo la meta fijada.
- **Superación amplia del objetivo**: Si el usuario estudia más de la meta (p. ej., 150%), la barra no debe desbordarse fuera de su contenedor (ancho máximo visual 100%).

---

## 6. Criterios de finalización (DoD)

1. Funciones de cálculo puro probadas exhaustivamente con `node --test` recibiendo la fecha "hoy" por parámetro.
2. Persistencia en `localStorage` con clave dedicada sin alterar ni romper la retrocompatibilidad de `diario-estudio-sesiones`.
3. Verificación de UI responsive en móvil (375 px) y escritorio.
4. Documentación y `MEMORY.md` actualizados.
