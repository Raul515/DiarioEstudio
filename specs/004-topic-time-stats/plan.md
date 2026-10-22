# Plan Técnico: Estadísticas de Tiempo por Tema (004-topic-time-stats)

Este documento detalla la implementación técnica de la especificación `004-topic-time-stats`, respetando la constitución del proyecto.

## 1. Archivos afectados y responsabilidades

- **`topic-stats.js` (Crear)** — Lógica pura
  - *Responsabilidad*:
    - Función `normalizeTopic(name)`: normaliza un nombre de tema para agrupación (minúsculas, sin tildes, sin guiones, sin espacios extra).
    - Función `toTitleCase(name)`: convierte un texto a Title Case (cada palabra capitalizada).
    - Función `formatDuration(minutes)`: formatea minutos en texto legible (`"45 min"` o `"2h 30min"`).
    - Función `getWeekRangeForOffset(today, offset)`: devuelve `{ startStr, endStr, label }` para la semana actual (offset=0), la anterior (offset=-1), etc. Semana = lunes a domingo.
    - Función `getMonthRangeForOffset(today, offset)`: devuelve `{ startStr, endStr, label }` para el mes actual (offset=0), anterior (offset=-1), etc.
    - Función `buildTopicRanking(sessions, startStr, endStr)`: filtra sesiones por rango de fechas, agrupa por tema normalizado, suma minutos, y devuelve un array ordenado de `{ displayName, totalMinutes, percentage }` más el total agregado.
  - *Cobertura*: RF-1, RF-2, RF-4, RF-5.
  - *Patrón*: Igual que `goal.js` y `heatmap.js` — funciones puras con exportación condicional `module.exports` para tests.

- **`index.html` (Modificar)**
  - *Responsabilidad*:
    - Reestructurar la sección del objetivo semanal (`weekly-goal-section`) envolviéndola en un nuevo contenedor flex/grid de 3 columnas junto con los dos paneles nuevos.
    - Añadir el `<script src="topic-stats.js">` antes de `app.js`.
    - Añadir la estructura HTML de los dos paneles (mensual a la izquierda, semanal a la derecha).
  - *Cobertura*: RF-6.

- **`styles.css` (Modificar)**
  - *Responsabilidad*:
    - Estilos del contenedor de 3 columnas (`display: grid`, `grid-template-columns: 1fr 1fr 1fr`).
    - Media query para apilar en móvil (`<= 768px`).
    - Estilos de los paneles: cabecera con flechas de navegación, lista scrollable, barras de proporción.
  - *Cobertura*: RF-6.

- **`app.js` (Modificar)**
  - *Responsabilidad*:
    - Añadir función `renderTopicStats()` que invoque las funciones puras de `topic-stats.js` y renderice ambos paneles en el DOM.
    - Manejar el estado de navegación (offset semanal y mensual).
    - Configurar eventos de las flechas de navegación con `setupTopicStatsEvents()`.
    - Añadir la llamada a `renderTopicStats()` dentro de `updateUI()`.
  - *Cobertura*: RF-1, RF-2, RF-3.

- **`tests/topic-stats.test.js` (Crear)**
  - *Responsabilidad*: Tests unitarios con `node --test` para todas las funciones puras.
  - *Cobertura*: RNF-3.

---

## 2. Diseño de la lógica pura (`topic-stats.js`)

### 2.1 Normalización de temas (RF-4)

```javascript
function normalizeTopic(name) {
    return name
        .normalize('NFD')                    // Descompone diacríticos (é → e + ́)
        .replace(/[\u0300-\u036f]/g, '')     // Elimina los diacríticos
        .replace(/-/g, ' ')                  // Guiones → espacios
        .replace(/\s+/g, ' ')               // Colapsa espacios múltiples
        .trim()                              // Recorta inicio/fin
        .toLowerCase();                      // Todo a minúsculas
}
```

**Nota importante**: `String.prototype.normalize('NFD')` está disponible en todos los navegadores modernos y en Node.js, sin dependencias.

### 2.2 Title Case (CA 4.3)

```javascript
function toTitleCase(name) {
    return name
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
}
```

Capitaliza la primera letra de cada palabra, respetando el texto original (no elimina diacríticos para el nombre mostrado).

### 2.3 Formato de duración (RF-5)

```javascript
function formatDuration(minutes) {
    if (minutes < 60) return minutes + ' min';
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return m > 0 ? h + 'h ' + m + 'min' : h + 'h';
}
```

### 2.4 Rangos temporales (RF-3)

**Semana** (`getWeekRangeForOffset`):
- Reutiliza la misma lógica de `getWeekRange` de `goal.js` (lunes a domingo, mediodía local para evitar DST).
- Recibe `today` y un `offset` entero (0 = actual, -1 = anterior, +1 = siguiente).
- Devuelve `{ startStr, endStr, label }`. El `label` es el rango legible: "19 oct – 25 oct 2026".

**Mes** (`getMonthRangeForOffset`):
- `startStr` = primer día del mes, `endStr` = último día del mes.
- `label` = nombre del mes y año: "Octubre 2026".
- Offset: 0 = mes actual, -1 = mes anterior.

### 2.5 Ranking de temas (`buildTopicRanking`)

```
Entrada: sessions[], startStr, endStr
1. Filtrar sesiones donde startStr <= date <= endStr
2. Para cada sesión, calcular la clave normalizada con normalizeTopic(topic)
3. Agrupar: sumar minutos por clave normalizada
4. Para el nombre a mostrar: aplicar toTitleCase al primer tema original encontrado para esa clave
5. Calcular porcentaje de cada tema respecto al total del período
6. Ordenar descendente por totalMinutes
7. Devolver { topics: [{ displayName, totalMinutes, percentage }], totalMinutes }
```

---

## 3. Diseño de la interfaz (RF-6)

### 3.1 Estructura HTML de cada panel

```html
<section class="topic-stats-panel" id="topic-stats-weekly">
    <div class="topic-stats-header">
        <button type="button" class="topic-stats-nav" id="weekly-prev" aria-label="Semana anterior">◀</button>
        <h3 class="topic-stats-title" id="weekly-title">19 oct – 25 oct 2026</h3>
        <button type="button" class="topic-stats-nav" id="weekly-next" aria-label="Semana siguiente">▶</button>
    </div>
    <div class="topic-stats-total" id="weekly-total">Total: 5h 30min</div>
    <div class="topic-stats-list" id="weekly-list">
        <!-- Items generados dinámicamente -->
    </div>
</section>
```

Cada ítem del ranking:
```html
<div class="topic-stats-item">
    <div class="topic-stats-name">Inglés</div>
    <div class="topic-stats-bar-wrap">
        <div class="topic-stats-bar" style="width: 45%"></div>
    </div>
    <div class="topic-stats-time">2h 30min</div>
</div>
```

### 3.2 Layout de 3 columnas

El contenedor actual `weekly-goal-section` se envolverá en un nuevo `<div class="stats-row">` junto con los dos paneles. En CSS:

```css
.stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
}

@media (max-width: 768px) {
    .stats-row {
        grid-template-columns: 1fr;
    }
}
```

Orden en el grid: Panel mensual (columna 1) | Objetivo semanal (columna 2) | Panel semanal (columna 3).

### 3.3 Scroll interno

```css
.topic-stats-list {
    max-height: 280px;
    overflow-y: auto;
}
```

---

## 4. Estado de navegación en `app.js`

Dos variables globales simples:
```javascript
var weeklyStatsOffset = 0;   // 0 = semana actual, -1 = anterior...
var monthlyStatsOffset = 0;  // 0 = mes actual, -1 = anterior...
```

Los botones de navegación modifican estos offsets y llaman a `renderTopicStats()`.

Cuando `updateUI()` se ejecuta (tras añadir/editar/borrar sesión), llama a `renderTopicStats()` con los offsets actuales, de modo que no se pierde la semana/mes que estaba visualizando el usuario.

---

## 5. Decisiones técnicas y alternativas

| Decisión tomada | Justificación | Alternativa descartada |
| --- | --- | --- |
| **`String.normalize('NFD')` para diacríticos** | Nativo en todos los navegadores modernos y Node.js. Sin dependencias. | Tabla manual de equivalencias (frágil y costosa de mantener). |
| **Title Case para el nombre mostrado** | Requisito del usuario. Se aplica sobre el primer texto original encontrado. | Usar el texto tal cual se introdujo (inconsistente visualmente). |
| **Grid de 3 columnas** | Layout pedido por el usuario. Se colapsa a 1 columna en móvil naturalmente. | Flexbox con wrapping (menos predecible en el orden de columnas). |
| **Offsets enteros para navegación** | Simplicidad máxima. No hace falta almacenar fechas de referencia. | Almacenar la fecha de referencia como estado (innecesario para avanzar/retroceder). |
| **Scroll interno con `max-height` + `overflow-y: auto`** | Solución CSS pura, sin JS. | Virtualización del scroll (sobreingeniería para listas de temas). |
| **No filtrar fechas futuras en el ranking** | A diferencia de las rachas, en los rankings no hay impacto lógico. Simplifica el código. | Añadir el mismo filtro de fechas futuras que usan las rachas. |
