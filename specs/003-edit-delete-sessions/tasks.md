# Tareas: Editar y Eliminar Sesiones (003-edit-delete-sessions)

## Fase 1: Estilos visuales
1. [x] En `styles.css`, añadir las reglas CSS para el nuevo contenedor `.session-actions` (alineado a la derecha, flexbox).
2. [x] En `styles.css`, añadir estilos básicos para los botones `.edit-btn` y `.delete-btn` (sin bordes, cursor pointer, opacidad al hacer hover).
3. [x] En `styles.css`, añadir las clases para el modo de edición: `.inline-edit-form` (display flex o grid, gaps), y estilos para sus inputs `.edit-topic` y `.edit-minutes` y botones de guardar/cancelar. Asegurarse de que sea responsive.

## Fase 2: Compatibilidad de Datos
4. [x] En `app.js`, modificar la función `loadData()`. Añadir una variable `let needsSave = false`. Dentro del mapeo de las sesiones, comprobar si el ítem original carecía de `id`. Si es así, poner `needsSave = true`. Al terminar el mapeo, si `needsSave` es verdadero, llamar a `saveData()` para hacer permanente la migración.

## Fase 3: Renderizado de la Interfaz
5. [x] En `app.js`, modificar `renderSessions()`: 
   - Añadir al `innerHTML` del `li.session-item` un bloque de `<div class="session-actions">` conteniendo los botones de Editar (✏️) y Eliminar (🗑️), ambos con el atributo `data-id="${session.id}"`.
   - Modificar la estructura del `li` si es necesario para asegurar que la flexbox coloque las acciones a la derecha correctamente.

## Fase 4: Lógica de Interacción (Eventos)
6. [x] En `app.js`, crear una función `setupSessionEvents()` y llamarla desde `init()`.
7. [x] En `setupSessionEvents()`, añadir un event listener para el evento `click` sobre `sessionsContainer`.
   - Implementar lógica para el botón Eliminar: usar `window.confirm`. Si aprueba, filtrar el elemento en el array `sessions`, llamar a `saveData()` y luego a `updateUI()`.
   - Implementar lógica para el botón Editar: extraer el ID. Encontrar la sesión en el array. Reemplazar el `innerHTML` del `li` padre por el marcado del `<form class="inline-edit-form">` rellenado con el `topic` y `minutes` actuales.
   - Implementar lógica para el botón Cancelar: llamar a `renderSessions()` para restablecer la vista (descartando los cambios).
8. [x] En `setupSessionEvents()`, añadir un event listener para el evento `submit` sobre `sessionsContainer`.
   - Prevenir el recargo de página (`e.preventDefault()`).
   - Si el target tiene la clase `inline-edit-form`, obtener el ID del dataset, extraer los valores de `.edit-topic` y `.edit-minutes`.
   - Validar que no estén vacíos y que los minutos sean > 0.
   - Actualizar los valores en el array `sessions`, llamar a `saveData()` y por último a `updateUI()`.

## Fase 5: Validación Manual y Cierre
9. [x] Cargar `index.html` en Chrome DevTools (con MCP o manualmente) y probar: borrar una sesión antigua (sin ID inicialmente), editar tema, editar minutos.
10. [x] Verificar que tras borrar o editar, el progreso de la meta semanal, el mapa de calor y la racha actual/histórica se recalculan instantáneamente sin fallos.
11. [x] Actualizar el archivo `MEMORY.md` con los cambios implementados y las lecciones aprendidas.
