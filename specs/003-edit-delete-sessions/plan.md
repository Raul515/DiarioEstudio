# Plan Técnico: Editar y Eliminar Sesiones (003-edit-delete-sessions)

Este documento detalla la implementación técnica de la especificación `003-edit-delete-sessions`, respetando estrictamente los principios de diseño y simplicidad del proyecto.

## 1. Archivos afectados y responsabilidades

- **`app.js` (Modificar)**
  - *Responsabilidad*: 
    - Consolidar la asignación de IDs únicos. Actualmente `loadData()` inyecta un ID temporal en memoria si falta, pero no lo guarda; se debe modificar para que invoque `saveData()` si se migró alguna sesión.
    - Modificar `renderSessions()` para incluir los botones de Editar y Eliminar en cada fila.
    - Añadir una nueva función `setupSessionEvents()` para manejar la delegación de eventos en la lista de sesiones, procesando los clics en los botones de acción.
    - Manejar la lógica de sustitución de un elemento de la lista por un formulario de edición in-line (o reemplazando su HTML) para actualizar el `topic` y `minutes`.
  - *Cobertura*: RF-1, RF-2, RF-3.
- **`styles.css` (Modificar)**
  - *Responsabilidad*: 
    - Estilizar los nuevos botones de acción (Editar / Eliminar) para que queden alineados a la derecha del elemento.
    - Estilizar el modo edición del ítem de sesión para que el formulario en línea se vea coherente y amigable (inputs del tamaño correcto, botones de confirmación y cancelación).
  - *Cobertura*: RF-1, RF-2.
- **`index.html` (Sin cambios estructurales mayores)**
  - *Responsabilidad*: No se necesitan nuevos elementos estructurales base, ya que todo se inyecta de forma dinámica dentro del contenedor `<ul id="sessions-container">`.

---

## 2. Estrategia de IDs y persistencia (RF-3 y Casos Límite)

La función `loadData()` ya cuenta con un código defensivo que asigna un `id` aleatorio si `item.id` es nulo:
```javascript
id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6)
```
Sin embargo, no guarda este cambio en el `localStorage`.
**Cambio requerido:** Añadir un flag booleano `let needsSave = false;` en `loadData()`. Si algún `item.id` no existía originalmente, `needsSave = true`. Al final de la función, si `needsSave` es verdadero, llamar a `saveData()`. Esto garantiza la compatibilidad total y persistencia hacia atrás sin intervención del usuario.

---

## 3. Estrategia de la Interfaz (RF-1 y RF-2)

### Botones en el ítem de sesión
Se inyectarán dos botones pequeños (usando emojis o texto corto para no requerir librerías de iconos, respetando la constitución) dentro del HTML generado en `renderSessions()`:
```html
<div class="session-actions">
    <button class="edit-btn" data-id="[ID]">✏️</button>
    <button class="delete-btn" data-id="[ID]">🗑️</button>
</div>
```

### Formulario en línea (In-line Edit)
Cuando se pulse `.edit-btn`, se buscará el `li` contenedor y se reemplazará su `innerHTML` por una versión de edición:
```html
<form class="inline-edit-form" data-id="[ID]">
    <input type="text" class="edit-topic" value="[Tema actual]" required />
    <input type="number" class="edit-minutes" value="[Minutos]" min="1" required />
    <div class="edit-actions">
        <button type="submit" class="save-btn">Guardar</button>
        <button type="button" class="cancel-btn">Cancelar</button>
    </div>
</form>
```

### Delegación de eventos
Para evitar tener que asociar cientos de *event listeners* cuando hay muchas sesiones, se utilizará la técnica de delegación de eventos directamente en el `sessionsContainer` (`<ul id="sessions-container">`). 

Se añadirá una función `setupSessionEvents()`:
- **Evento click:** 
  - Si el target es `.delete-btn`: Pedir `confirm('¿Seguro que quieres eliminar esta sesión?')`. Si es `true`, filtrar el array `sessions`, llamar a `saveData()` y luego a `updateUI()`.
  - Si el target es `.edit-btn`: Encontrar la sesión por ID, y re-renderizar ESE `li` específico con el formulario.
  - Si el target es `.cancel-btn`: Llamar a `renderSessions()` (o solo re-renderizar ese `li` con los datos originales) para descartar los cambios.
- **Evento submit:**
  - Si el target es `.inline-edit-form`: Prevenir comportamiento por defecto (`e.preventDefault()`). Extraer y validar el nuevo tema y minutos. Si es válido, actualizar la sesión en el array `sessions` basándose en el ID, llamar a `saveData()` y luego a `updateUI()`.

---

## 4. Pureza y Reactividad

- Las funciones de agregación (`calculateStreaks()`, `generateHeatmapData()`, `calculateWeeklyProgress()`) ya son completamente puras.
- Por tanto, al eliminar o editar una sesión, la simple invocación en cadena de `updateUI()` (que llama a su vez a todos los renders individuales) garantiza que la barra de objetivo semanal, el mapa de calor y la racha se recalculen con precisión absoluta partiendo del nuevo estado, sin necesidad de escribir lógica compensatoria adicional.

---

## 5. Decisiones técnicas y alternativas

| Decisión tomada | Justificación | Alternativa descartada |
| --- | --- | --- |
| **Inyectar ID y guardar al cargar (Migration)** | Cumple la regla 5 de la Constitución ("nunca se pierde una sesión") de forma transparente y eficiente. | Forzar una limpieza o pedir al usuario que reinicie datos, inaceptable para los usuarios. |
| **Delegación de eventos** | Optimización de recursos; no importa si hay 1.000 sesiones renderizadas, solo se usa 1 event listener de clic y 1 de submit para toda la lista. | Añadir *listeners* en cada vuelta del bucle `forEach` de `renderSessions()`. |
| **Uso de emojis para iconos** | "Simplicidad primero" (Regla 1). Evita añadir dependencias externas, SVGs pesados o fuentes como FontAwesome. | Añadir un link a FontAwesome, lo cual incumple la filosofía sin red/librerías. |
| **Formulario (form) para edición en línea** | Permite usar la validación nativa del navegador (`required`, `min="1"`) gratis, sin JS extra. | Usar simples `div` e `input` y validar los valores manualmente al hacer clic en guardar. |
