# Plan Técnico: Agrupación de Temas con Paréntesis y Expander de Subtemas (005-topic-subtopics-parentheses)

Este documento detalla la implementación técnica de la especificación `005-topic-subtopics-parentheses`, en cumplimiento estricto con la Constitución del proyecto.

## 1. Archivos afectados y responsabilidades

- **`topic-stats.js` (Modificar)** — Lógica pura
  - Función `parseTopic(rawTopic)`: extrae el `{ base, subtopic }` del nombre crudo de una sesión.
  - Actualización de `buildTopicRanking(sessions, startStr, endStr)`:
    - Agrupación por clave normalizada de `base`.
    - Agrupación interna de subtemas (`subtopic` normalizado o `'general'`).
    - Cálculo de minutos totales por subtema y porcentaje relativo al total del tema.
    - Generación de la propiedad `subtopics: [...]` dentro de cada objeto de tema en el ranking.
  - Cobertura: RF-1, RF-2, RF-4, RNF-1.

- **`app.js` (Modificar)** — Interfaz y DOM
  - Actualización de `renderPanel(totalEl, listEl, ranking, emptyMsg)`:
    - Identificar si `t.subtopics && t.subtopics.length > 1`.
    - Si cumple la condición: generar elemento semántico `<details class="topic-stats-item has-subtopics">` con `<summary>` y bloque hijo `.topic-subtopics-list`.
    - Si no cumple la condición: renderizar `<div class="topic-stats-item">` estándar.
  - Cobertura: RF-3, RF-4, RNF-4.

- **`styles.css` (Modificar)** — Presentación y estilos
  - Estilos para `details.topic-stats-item summary`: cursor pointer, reset de estilos nativos de lista (`::-webkit-details-marker`), alineación grid consistente con filas estándar.
  - Estilos para el icono indicador `.topic-expander-icon`: transición de rotación (`transform: rotate(90deg)`) cuando el details está abierto (`details[open]`).
  - Estilos para `.topic-subtopics-list`, `.topic-subtopic-item`, `.topic-subtopic-name`, `.topic-subtopic-time`, `.topic-subtopic-bar-wrap`, `.topic-subtopic-bar`.
  - Adaptabilidad responsive móvil (<= 768px).
  - Cobertura: RF-3, RF-4, RNF-4.

- **`tests/topic-stats.test.js` (Modificar)** — Tests automatizados
  - Tests unitarios exhaustivos para `parseTopic`.
  - Tests unitarios para `buildTopicRanking` verificando:
    - Agrupación de temas con diferentes paréntesis.
    - Generación de array `subtopics` ordenado descendente.
    - Manejo de sesiones sin paréntesis agrupadas como `General`.
    - Temas con un solo subtema o sin subtemas (sin expander).
  - Cobertura: RNF-2.

---

## 2. Diseño detallado de la lógica pura (`topic-stats.js`)

### 2.1 Función `parseTopic(rawTopic)`

```javascript
function parseTopic(rawTopic) {
    if (typeof rawTopic !== 'string') {
        return { base: '', subtopic: null };
    }
    var trimmed = rawTopic.trim();
    if (!trimmed) {
        return { base: '', subtopic: null };
    }

    // Detectar especificaciones entre paréntesis
    var match = trimmed.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
    if (match) {
        var basePart = match[1].trim();
        var subtopicPart = match[2].trim();

        // Caso límite: solo había texto entre paréntesis: ej. "(Tema 1)"
        if (!basePart && subtopicPart) {
            return { base: subtopicPart, subtopic: null };
        }

        // Si el paréntesis estaba vacío: ej. "Tema ()"
        if (basePart && !subtopicPart) {
            return { base: basePart, subtopic: null };
        }

        return {
            base: basePart,
            subtopic: subtopicPart || null
        };
    }

    return { base: trimmed, subtopic: null };
}
```

### 2.2 Integración en `buildTopicRanking`

Dentro de `buildTopicRanking`:
1. Para cada sesión válida en el rango `[startStr, endStr]`:
   - `var parsed = parseTopic(topicName);`
   - `var baseKey = normalizeTopic(parsed.base);`
   - Si `baseKey === ''` continuar.
   - En el grupo del tema principal (`groups[baseKey]`):
     - Acumular `totalMinutes += mins`.
     - Si es la primera vez que se ve el tema, guardar `originalName: parsed.base`.
     - Mantener un mapa de subtemas `group.subtopicsMap`.
     - Determinar la clave y nombre visible del subtema:
       - Si `parsed.subtopic`: `subKey = normalizeTopic(parsed.subtopic)`, `subName = parsed.subtopic`.
       - Si no hay subtema: `subKey = '__general__'`, `subName = 'General'`.
     - Acumular minutos en el mapa de subtemas.
2. Al construir el array de salida de temas:
   - Para cada tema agrupado:
     - Convertir los subtemas en un array.
     - Si solo hay 1 subtema y coincide con `__general__`, el array de subtemas queda vacío `[]`.
     - Si hay subtemas, ordenarlos por `totalMinutes` descendente y calcular su `percentage` relativo al total del tema:
       `Math.round((sub.totalMinutes / group.totalMinutes) * 100)`.
     - Asignar `subtopics` al objeto del tema.

---

## 3. Diseño de la UI y HTML

```html
<!-- Fila con expander (2 o más subtemas) -->
<details class="topic-stats-item has-subtopics">
    <summary class="topic-stats-summary">
        <div class="topic-stats-name" title="Estudiar Teoria Sistemas Distribuidos">
            <span class="topic-expander-icon" aria-hidden="true">▸</span>
            Estudiar Teoria Sistemas Distribuidos
            <span class="topic-subtopics-count" title="2 subtemas">2</span>
        </div>
        <div class="topic-stats-time">1h 7min</div>
        <div class="topic-stats-bar-wrap">
            <div class="topic-stats-bar" style="width: 42%"></div>
        </div>
    </summary>
    <div class="topic-subtopics-list">
        <div class="topic-subtopic-item">
            <div class="topic-subtopic-name" title="Temas 3 y 5">Temas 3 y 5</div>
            <div class="topic-subtopic-time">55 min</div>
            <div class="topic-subtopic-bar-wrap">
                <div class="topic-subtopic-bar" style="width: 82%"></div>
            </div>
        </div>
        <div class="topic-subtopic-item">
            <div class="topic-subtopic-name" title="Tema 4">Tema 4</div>
            <div class="topic-subtopic-time">12 min</div>
            <div class="topic-subtopic-bar-wrap">
                <div class="topic-subtopic-bar" style="width: 18%"></div>
            </div>
        </div>
    </div>
</details>

<!-- Fila simple (0 o 1 subtema) -->
<div class="topic-stats-item">
    <div class="topic-stats-name" title="Ingles">Ingles</div>
    <div class="topic-stats-time">2h 40min</div>
    <div class="topic-stats-bar-wrap">
        <div class="topic-stats-bar" style="width: 100%"></div>
    </div>
</div>
```
