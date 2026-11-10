# Especificación: Agrupación de Temas con Paréntesis y Expander de Subtemas (005-topic-subtopics-parentheses)

**Estado**: Aprobado

## 1. Contexto y objetivo

### 1.1 Contexto
En el Diario de Estudio, los estudiantes suelen añadir especificaciones o subtemas entre paréntesis al registrar una sesión (por ejemplo, `Estudiar Teoria Sistemas Distribuidos (Tema 4)` y `Estudiar Teoria Sistemas Distribuidos (Temas 3 y 5)`). Actualmente, el sistema considera estos textos como temas completamente distintos, fragmentando el tiempo total dedicado a la asignatura y distorsionando los paneles de estadísticas semanal y mensual.

### 1.2 Objetivo
Permitir que el sistema detecte y agrupe automáticamente sesiones que pertenecen al mismo tema base, ignorando el texto entre paréntesis a efectos de la suma acumulada de tiempo en los rankings semanales y mensuales. Si un tema contiene 2 o más subtemas distintos (o una mezcla de sesiones generales y subtemas), la fila en el ranking se convertirá en un desplegable (*expander*) interactivo accesible que desglosará el tiempo y la proporción dedicada a cada subtema.

---

## 2. Usuarios

- **Estudiante / Opositor / Autodidacta**: Quiere desglosar sus sesiones por temas o capítulos específicos usando paréntesis sin perder la visión agregada del tiempo total que invierte en la materia principal.

---

## 3. Historias de usuario

- **HU-1 (Agrupación por tema base)**: Como estudiante, quiero que las sesiones que comparten un mismo nombre base con especificaciones entre paréntesis se sumen en un único concepto en las estadísticas, para ver el tiempo total real invertido en esa materia.
- **HU-2 (Desglose interactivo de subtemas)**: Como estudiante, quiero poder hacer clic en un tema que tenga 2 o más subtemas para desplegar un expander y ver cuánto tiempo he dedicado a cada subtema específico.
- **HU-3 (Sesiones generales y específicas)**: Como estudiante, si registro sesiones generales de la materia (sin paréntesis) y sesiones con temas entre paréntesis, quiero que en el desplegable la parte general aparezca identificada claramente como "General" para que la suma total sea exacta y transparente.
- **HU-4 (Temas simples)**: Como estudiante, si un tema no tiene subtemas o solo tiene 1 subtema en ese período, quiero que se muestre como una fila normal sin expander, evitando clics o elementos innecesarios.

---

## 4. Requisitos funcionales

### RF-1: Detección y extracción de tema base y subtema
El sistema debe procesar los nombres de los temas para separar el tema principal de cualquier especificación entre paréntesis.

- **CA 1.1 (EARS Ubicuo)**: Si un tema incluye contenido entre paréntesis (ej. `Estudiar Teoria Sistemas Distribuidos (Tema 4)`), el tema base debe ser el texto exterior (`Estudiar Teoria Sistemas Distribuidos`) y el subtema el interior (`Tema 4`).
- **CA 1.2 (EARS Ubicuo)**: Si un tema no incluye paréntesis (ej. `Ingles`), el tema base es el texto completo y el subtema es nulo (`null`).
- **CA 1.3 (EARS Ubicuo)**: Si un tema solo contiene texto entre paréntesis (ej. `(Tema 1)`), el tema base pasa a ser dicho texto interior (`Tema 1`) sin subtema.
- **CA 1.4 (EARS Ubicuo)**: La extracción debe ignorar espacios sobrantes antes, después o dentro de los paréntesis.
- **CA 1.5 (EARS Ubicuo)**: Los datos almacenados en `localStorage` NO deben ser modificados; la extracción ocurre exclusivamente en memoria durante la agregación estadística.

### RF-2: Agrupación y suma en paneles de estadísticas
Los paneles semanal y mensual deben consolidar las sesiones bajo el tema base normalizado.

- **CA 2.1 (EARS Ubicuo)**: El ranking debe ordenar los temas basándose en la suma de minutos de todas las sesiones cuyo tema base coincida tras normalizarse (minúsculas, sin tildes, sin guiones).
- **CA 2.2 (EARS Ubicuo)**: El nombre visible en la fila principal del ranking debe ser el tema base capitalizado en Title Case (ej. `Estudiar Teoria Sistemas Distribuidos`).
- **CA 2.3 (EARS Ubicuo)**: La barra horizontal de progreso del tema principal debe representar su porcentaje respecto al tiempo total acumulado en dicho período (semana o mes).

### RF-3: Expander interactivo de subtemas
Cuando un tema agrupado esté constituido por 2 o más especificaciones distintas, la fila debe permitir desplegar su desglose.

- **CA 3.1 (EARS Ubicuo)**: Un tema se considera desplegable SI Y SOLO SI tiene 2 o más subtemas distintos (incluyendo la categoría `General` si conviven sesiones sin paréntesis y con paréntesis).
- **CA 3.2 (EARS Ubicuo)**: Si un tema tiene 0 o 1 subtema en el período, se renderiza como una fila estática estándar sin indicador de despliegue ni interactividad.
- **CA 3.3 (EARS Evento)**: CUANDO el usuario pulse sobre un tema desplegable (o active la fila mediante teclado `Enter`/`Espacio`), la fila debe abrir o cerrar suavemente la lista de subtemas.
- **CA 3.4 (EARS Ubicuo)**: La fila desplegable debe contar con un icono indicador (ej. `▸`) que rote 90° al expandirse.
- **CA 3.5 (EARS Ubicuo)**: La implementación debe utilizar elementos semánticos estándar HTML5 `<details>` y `<summary>` para asegurar compatibilidad y accesibilidad universal.

### RF-4: Visualización y ordenación de subtemas en el expander
El desglose dentro del expander debe ser claro, proporcional y ordenado.

- **CA 4.1 (EARS Ubicuo)**: Los subtemas deben mostrarse ordenados de mayor a menor tiempo dedicado.
- **CA 4.2 (EARS Ubicuo)**: Cada subtema debe mostrar su nombre, su tiempo formateado (ej. `55 min`, `1h 10min`) y una mini-barra de porcentaje relativa al tiempo total de ese tema base.
- **CA 4.3 (EARS Ubicuo)**: Si existen sesiones sin paréntesis agrupadas junto a sesiones con paréntesis, las sesiones sin paréntesis se listarán bajo el nombre `General`.

---

## 5. Requisitos no funcionales

- **RNF-1 (Separación de lógica)**: Las funciones de parseo, agrupación y cálculo deben ser puras y ubicarse en `topic-stats.js`, sin depender del DOM ni de `localStorage`.
- **RNF-2 (Cobertura de tests)**: Toda la nueva lógica pura debe probarse con tests unitarios automatizados mediante `node --test`.
- **RNF-3 (Sin dependencias)**: Sin frameworks, sin paquetes de npm, sin paso de compilación. Funcionamiento directo con doble clic (`file://`).
- **RNF-4 (Accesibilidad y Responsive)**: El expander debe ser operable con teclado y visualizarse de forma óptima tanto en escritorio como en pantallas móviles (375px).

---

## 6. Casos límite

- **Sesiones con paréntesis idénticos con distinto casing**: `(Tema 4)` y `(tema 4)` deben consolidarse en el mismo subtema con tiempo acumulado.
- **Solo paréntesis**: Si un tema es únicamente `(Tema 4)`, se trata como tema base `Tema 4`.
- **Paréntesis vacíos**: `Tema ()` o `Tema ( )` se trata como `Tema` sin subtema.
- **Subtemas con números y conjunciones**: `(Temas 3 y 5)` debe conservar su formato legible y no sufrir distorsiones.
- **Navegación temporal**: Al retroceder o avanzar de semana o mes, el ranking se recalcula limpiamente y los temas desplegables inician contraídos por defecto.
