# Especificación: Estadísticas de Tiempo por Tema (004-topic-time-stats)

**Estado**: Aprobado

## 1. Contexto y objetivo

### 1.1 Contexto
El Diario de Estudio permite registrar sesiones con tema y duración, pero actualmente no ofrece ninguna vista agregada que muestre cuánto tiempo se ha dedicado a cada tema. El usuario no puede responder fácilmente a "¿a qué he dedicado más tiempo esta semana?" o "¿cuánto Inglés estudié en septiembre?".

### 1.2 Objetivo
Añadir dos paneles (semanal y mensual) que muestren un ranking de temas ordenados por tiempo dedicado, con navegación temporal (avanzar/retroceder semana o mes) y normalización flexible de nombres para agrupar correctamente variantes del mismo tema.

---

## 2. Usuarios

- **Estudiante / Autodidacta**: Quiere ver de un vistazo cómo distribuye su tiempo entre temas, detectar desequilibrios y comparar su dedicación entre semanas o meses distintos.

---

## 3. Historias de usuario

- **HU-1 (Ranking semanal)**: Como estudiante, quiero ver un panel con el ranking de temas por tiempo dedicado en la semana actual, para saber a qué he dedicado más esfuerzo estos últimos días.
- **HU-2 (Ranking mensual)**: Como estudiante, quiero ver un panel equivalente para el mes actual, para tener una visión más amplia de mi distribución de estudio.
- **HU-3 (Navegación temporal)**: Como estudiante, quiero poder navegar a semanas y meses anteriores/posteriores con flechas, para consultar mi historial de dedicación.
- **HU-4 (Normalización de temas)**: Como estudiante, quiero que "Inglés", "ingles", "INGLÉS" y variantes similares se agrupen como un mismo tema, para no tener duplicados por errores tipográficos menores.
- **HU-5 (Total agregado)**: Como estudiante, quiero ver el total de tiempo estudiado en cada período (semana/mes) además del desglose por tema.

---

## 4. Requisitos funcionales

### RF-1: Panel de ranking semanal
El sistema debe mostrar un panel con el ranking de temas y su tiempo dedicado para una semana determinada.

- **CA 1.1 (EARS Ubicuo)**: El panel debe mostrar la semana actual por defecto (lunes a domingo, consistente con el mapa de calor).
- **CA 1.2 (EARS Ubicuo)**: El encabezado del panel debe mostrar el rango de fechas de la semana en formato legible (ej. "19 oct – 25 oct 2026").
- **CA 1.3 (EARS Ubicuo)**: Los temas deben aparecer ordenados de más tiempo a menos.
- **CA 1.4 (EARS Ubicuo)**: Cada tema debe mostrar una barra de proporción horizontal que refleje su porcentaje respecto al total de la semana.
- **CA 1.5 (EARS Ubicuo)**: Si no hay sesiones en la semana seleccionada, el panel debe mostrar un mensaje vacío (ej. "Sin sesiones esta semana").
- **CA 1.6 (EARS Ubicuo)**: El panel debe mostrar el total agregado de tiempo de la semana (ej. "Total: 5h 30min").

### RF-2: Panel de ranking mensual
El sistema debe mostrar un panel equivalente al semanal pero para un mes completo.

- **CA 2.1 (EARS Ubicuo)**: El panel debe mostrar el mes actual por defecto.
- **CA 2.2 (EARS Ubicuo)**: El encabezado del panel debe mostrar el mes y año (ej. "Octubre 2026").
- **CA 2.3–2.6**: Análogos a CA 1.3–1.6 pero para el rango mensual.

### RF-3: Navegación temporal
Ambos paneles deben permitir navegar adelante y atrás en el tiempo.

- **CA 3.1 (EARS Evento)**: CUANDO el usuario pulse la flecha izquierda, el panel debe retroceder una semana / un mes y actualizar el ranking.
- **CA 3.2 (EARS Evento)**: CUANDO el usuario pulse la flecha derecha, el panel debe avanzar una semana / un mes y actualizar el ranking.
- **CA 3.3 (EARS Ubicuo)**: No hay límite de navegación hacia el pasado ni hacia el futuro (las semanas/meses sin sesiones simplemente mostrarán el mensaje vacío).

### RF-4: Normalización de nombres de temas
El sistema debe agrupar temas que sean esencialmente el mismo nombre escrito de forma diferente.

- **CA 4.1 (EARS Ubicuo)**: La normalización debe ignorar: mayúsculas/minúsculas, espacios extra (inicio, fin y múltiples seguidos), guiones (`-`), y tildes/diacríticos (ej. `é` → `e`).
- **CA 4.2 (EARS Ubicuo)**: Ejemplos de equivalencia:
  - `Inglés` = `ingles` = `INGLÉS` = ` inglés ` 
  - `Standford Auto-Improving Agents` = `Standford Auto Improving Agents` = `standford auto improving agents`
  - `Matemáticas` = `Matematicas` = `MATEMATICAS`
- **CA 4.3 (EARS Ubicuo)**: El nombre mostrado en el ranking debe ser una versión capitalizada automática (Title Case): primera letra de cada palabra en mayúscula, el resto en minúscula (ej. "Standford Auto Improving Agents", "Inglés", "Matemáticas").
- **CA 4.4 (EARS Ubicuo)**: La normalización es solo para la visualización en estos paneles. NO debe modificar los datos originales almacenados en localStorage.

### RF-5: Formato de tiempo
- **CA 5.1 (EARS Ubicuo)**: Si el total de un tema es menor a 60 minutos, mostrar solo minutos: "45 min".
- **CA 5.2 (EARS Ubicuo)**: Si el total es 60 minutos o más, mostrar horas y minutos: "2h 30min". Si los minutos son 0, mostrar solo horas: "2h".

### RF-6: Layout en la página
- **CA 6.1 (EARS Ubicuo)**: En escritorio, los dos paneles y el objetivo semanal deben disponerse en 3 columnas: Panel mensual (izquierda) | Objetivo semanal (centro) | Panel semanal (derecha).
- **CA 6.2 (EARS Ubicuo)**: En móvil (<= 768px), los tres elementos se apilan verticalmente.
- **CA 6.3 (EARS Ubicuo)**: Cada panel debe tener scroll interno (barra deslizante vertical) si el contenido del ranking excede la altura fija del recuadro.

---

## 5. Requisitos no funcionales

- **RNF-1**: La lógica pura (cálculos de agrupación, normalización, filtrado por rango) debe estar en un archivo separado `topic-stats.js`, sin acceso al DOM ni a localStorage (Constitución, regla 3).
- **RNF-2**: Las funciones puras deben recibir el array de sesiones y los parámetros de rango como argumentos (Constitución, regla 3).
- **RNF-3**: La funcionalidad debe ser testeable con `node --test` (Constitución, regla 4).

---

## 6. Casos límite

- **Sin sesiones**: Paneles vacíos con mensaje indicativo. No errores.
- **Un solo tema en el período**: La barra de proporción ocupa el 100%.
- **Muchos temas**: El scroll interno del panel permite recorrer todos.
- **Temas con caracteres especiales**: La normalización solo actúa sobre casing, espacios, guiones y diacríticos. Otros caracteres (números, emojis, paréntesis…) se conservan.
- **Semana/mes sin sesiones al navegar**: Se muestra el mensaje vacío; las flechas siguen funcionando.
- **Navegación al futuro**: Funciona, simplemente mostrará "Sin sesiones".

---

## 7. Fuera de alcance

- No se modifican los datos almacenados en localStorage (la normalización es solo visual).
- No hay interacción con los temas del ranking (no se puede hacer clic para filtrar, editar, etc.).
- No hay gráficos circulares ni de otro tipo; solo ranking con barras de proporción.

---

## 8. Criterios de finalización (DoD)

1. Los dos paneles se renderizan correctamente con datos reales en escritorio y móvil.
2. La navegación temporal funciona en ambos paneles sin errores.
3. La normalización agrupa correctamente las variantes de temas documentadas en CA 4.2.
4. El scroll interno funciona cuando hay muchos temas.
5. Las funciones puras en `topic-stats.js` tienen tests con `node --test`.
6. El layout de 3 columnas (escritorio) / apilado (móvil) se verifica con Chrome DevTools MCP.
7. Sin errores en consola.
8. `MEMORY.md` actualizado.
