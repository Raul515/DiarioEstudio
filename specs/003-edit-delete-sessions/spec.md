# Especificación: Editar y Eliminar Sesiones (003-edit-delete-sessions)

**Estado**: Aprobado e Implementado

## 1. Contexto y objetivo

### 1.1 Contexto
Actualmente, el Diario de Estudio permite registrar nuevas sesiones (fecha, tema y duración), pero los usuarios no tienen forma de corregir errores si se equivocan al escribir el nombre del tema, la duración, o si desean borrar una sesión por completo.

### 1.2 Objetivo
Proporcionar controles en la interfaz de usuario para editar el nombre (tema) y el tiempo (minutos) de sesiones pasadas, así como la posibilidad de eliminarlas por completo. La fecha de la sesión no será editable para proteger la integridad de las métricas de racha y el mapa de calor, manteniendo el historial inmutable en cuanto a tiempo cronológico.

---

## 2. Usuarios

- **Estudiante / Autodidacta**: Necesita poder corregir errores en el registro (ej. puso 30 minutos pero eran 60, o escribió mal el tema) y borrar sesiones accidentales o duplicadas sin tener que reiniciar todo el progreso ni manipular el localStorage manualmente.

---

## 3. Historias de usuario

- **HU-1 (Eliminar sesión)**: Como estudiante, quiero tener un botón para eliminar una sesión específica de mi historial para poder borrar registros erróneos o duplicados.
- **HU-2 (Editar sesión - UI)**: Como estudiante, quiero tener un botón en cada sesión registrada para entrar en un "modo edición" y así corregir el tema y los minutos.
- **HU-3 (Editar sesión - Lógica)**: Como estudiante, quiero poder guardar los cambios de tema y minutos de una sesión (sin alterar su fecha) para que mi historial y estadísticas (totales, rachas y mapa de calor) se actualicen y reflejen la realidad.
- **HU-4 (Cancelación de edición)**: Como estudiante, quiero poder cancelar la edición de una sesión si me arrepiento, para mantener los datos originales.

---

## 4. Requisitos funcionales

### RF-1: Eliminar sesiones
El sistema debe permitir la eliminación de cualquier sesión individual registrada en el historial.

- **Criterio de aceptación 1.1 (EARS Evento)**: CUANDO el usuario haga clic en el botón de eliminar de una sesión del historial, el sistema debe solicitar confirmación antes de proceder, para evitar borrados accidentales.
- **Criterio de aceptación 1.2 (EARS Evento)**: CUANDO el usuario confirme la eliminación, el sistema debe remover la sesión de los datos en memoria, guardarlo en el `localStorage` (`diario-estudio-sesiones`), y re-renderizar la interfaz (historial, métricas, mapa de calor y barra de objetivo semanal).

### RF-2: Editar tema y minutos
El sistema debe permitir modificar el tema (texto) y la duración (minutos) de una sesión ya existente.

- **Criterio de aceptación 2.1 (EARS Evento)**: CUANDO el usuario haga clic en el botón de editar de una sesión del historial, la vista de esa fila debe cambiar a un formulario en línea (o similar) mostrando los valores actuales de tema y minutos como campos de entrada, y botones de guardar/cancelar.
- **Criterio de aceptación 2.2 (EARS Ubicuo)**: La fecha de la sesión NO debe ser un campo editable en ningún momento.
- **Criterio de aceptación 2.3 (EARS Evento)**: CUANDO el usuario guarde la edición, el sistema debe validar los nuevos datos (tema no vacío, minutos como número válido > 0). SI son válidos, actualizar la sesión en memoria, guardar en `localStorage`, y actualizar toda la interfaz visual.
- **Criterio de aceptación 2.4 (EARS Evento)**: CUANDO el usuario cancele la edición, el formulario debe cerrarse y mostrar los datos originales sin realizar ningún cambio.

### RF-3: Identificación única de sesiones
Actualmente los objetos sesión no tienen un ID único, lo que dificulta la edición/eliminación fiable.

- **Criterio de aceptación 3.1 (EARS Ubicuo)**: El sistema debe asignar un `id` único (por ejemplo, usando `Date.now()` o una cadena aleatoria corta) al crear nuevas sesiones, para poder identificar inequívocamente cuál sesión editar o borrar.
- **Criterio de aceptación 3.2 (EARS Opcional)**: DONDE las sesiones antiguas en `localStorage` no tengan `id`, el sistema debe soportarlo. Al cargar la app, se debe inyectar un `id` a las sesiones que no lo tengan para garantizar compatibilidad hacia atrás sin perder datos (ver Constitución, regla 5).

---

## 5. Casos límite

- **Migración de datos antiguos**: Al cargar datos antiguos que carecen del campo `id`, el sistema debe inyectarles un `id` único en memoria para poder operar con ellos (se guardará en el `localStorage` cuando ocurra la próxima actualización).
- **Campos inválidos en la edición**: Si se introduce texto vacío para el tema o valores numéricos incorrectos/negativos para minutos, se debe denegar el guardado, manteniendo el modo edición o mostrando un error temporal (ej. alerta o estilo rojo), sin corromper la sesión original.
- **Impacto en métricas tras borrado/edición**: Si se borra la única sesión de un día en medio de una racha, esa racha se debe romper y recalcularse. El recálculo está garantizado por la pureza de las funciones existentes si se vuelve a renderizar todo correctamente.

---

## 6. Criterios de finalización (DoD)

1. Botones de editar y borrar integrados en cada ítem del historial de manera limpia y responsiva (móvil y escritorio).
2. Compatibilidad hacia atrás garantizada para las sesiones guardadas previamente (asignación de ID).
3. La interfaz completa se actualiza inmediatamente tras un borrado o una edición.
4. Verificación manual rigurosa desde Chrome DevTools (MCP) asegurando la actualización correcta del localStorage y DOM.
5. Documentación y `MEMORY.md` actualizados.
