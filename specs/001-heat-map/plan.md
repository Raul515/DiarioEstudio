# Plan Técnico: Mapa de Calor (001-heat-map)

Este documento detalla la implementación técnica de la especificación `001-heat-map`, respetando estrictamente los principios de diseño de `docs/constitution.md`.

## 1. Archivos afectados y responsabilidades

- **`index.html` (Modificar)**
  - *Responsabilidad*: Añadir el maquetado (marcado) del contenedor del mapa de calor y el panel de texto inferior.
  - *Cobertura*: HU-1, HU-3, RF-4.
- **`styles.css` (Modificar)**
  - *Responsabilidad*: Definir las variables y reglas CSS para el mapa usando una cuadrícula (CSS Grid), las paletas de color para los niveles 0 al 4, estilos responsivos para móvil y ocultamiento estructural de celdas.
  - *Cobertura*: RF-3, RNF-1, RNF-2.
- **`heatmap.js` (NUEVO)**
  - *Responsabilidad*: Contener exclusivamente las funciones lógicas puras (sin referencias al DOM, a la ventana, ni a `localStorage`) que calculan las fechas, los niveles y la matriz de datos del mapa. Se inyectará en `index.html` antes de `app.js`.
  - *Cobertura*: RF-1, RF-2, RF-3, RNF-4 (Principio 3).
- **`app.js` (Modificar)**
  - *Responsabilidad*: Orquestar el DOM. Obtener los datos almacenados, pasarlos a las funciones lógicas de `heatmap.js`, renderizar el resultado visualmente e inyectar el manejo unificado de eventos de interacción.
  - *Cobertura*: RF-4, RF-5 (Principio 1 y 2).
- **`tests/heatmap.test.js` (NUEVO)**
  - *Responsabilidad*: Batería de pruebas automatizadas sobre la lógica pura utilizando `node --test` nativo, garantizando su fiabilidad antes de tocar interfaz visual.
  - *Cobertura*: RNF-4 (Principio 4).

---

## 2. Funciones puras de lógica

Toda la lógica estará centralizada en una función pura principal ubicada en `heatmap.js`:

`generateHeatmapData(sessions, today)`
- **Parámetros**:
  - `sessions`: Array crudo de las sesiones `{date, minutes}`.
  - `today`: Instancia de `Date` que representa el «hoy» del usuario.
- **Salida**:
  - Un array secuencial de 84 objetos (12 semanas × 7 días), donde cada celda contendrá:
    `{ dateStr: "AAAA-MM-DD", displayDate: "[Día], D de [Mes]...", minutes: Number, level: Number (0-4), isFuture: Boolean }`.

*Funciones puras de apoyo complementarias:*
- `getStartDate(today)`: Calcula el lunes correspondiente a 11 semanas atrás.
- `calculateLevel(minutes)`: Resuelve los umbrales fijos (0, 1-29, 30-59, 60-119, 120+).
- `formatDisplayDate(dateStr)`: Genera el texto en español para la celda y el panel.

---

## 3. Algoritmo del mapa en pseudocódigo (RF-1, RF-2, RF-3)

```text
FUNCIÓN generateHeatmapData(sessions, today):
    1. calcular startDate = Lunes situado 11 semanas exactas antes de 'today'
    2. inicializar mapMinutos = diccionario vacío
    
    3. POR CADA session EN sessions:
        a. SI session.date es futura respecto a 'today' O anterior a startDate:
            CONTINUAR (ignorar, RF-2.3)
        b. procesar mins = convertir session.minutes a número
        c. SI mins NO ES NUMERO O mins < 0: mins = 0 (RF-2.4)
        d. mapMinutos[session.date] = mapMinutos[session.date] + mins (RF-2.1)

    4. inicializar gridData = lista vacía de 84 elementos
    
    5. PARA indice DESDE 0 HASTA 83 (12 semanas * 7 días):
        a. fechaActual = sumar indice días a startDate
        b. fechaStr = formato local "AAAA-MM-DD" de fechaActual
        c. minutos = mapMinutos[fechaStr] O 0
        d. nivel = calculateLevel(minutos) (RF-3.1 a 3.5)
        e. esFuturo = fechaActual > today (RF-1.4)
        f. textoFecha = formatDisplayDate(fechaActual)
        
        g. AÑADIR A gridData UN OBJETO:
            { date: fechaStr, display: textoFecha, minutes: minutos, level: nivel, isFuture: esFuturo }
            
    6. DEVOLVER gridData
```

---

## 4. Estrategia de dibujado en interfaz (RF-4, RF-5, RNF-1, RNF-2)

- **Renderizado del contenedor**: `app.js` recibe el array de 84 elementos e itera imprimiendo 84 divs consecutivos en el DOM, con atributos `data-display` y `data-minutes`.
- **Estructura visual y CSS Grid**: El contenedor usará un grid CSS robusto (`display: grid; grid-auto-flow: column; grid-template-rows: repeat(7, 1fr)`). Esto obliga al navegador a apilar los div en 7 filas verticales que bajan lunes a domingo, fluyendo hacia la derecha para hacer las 12 columnas.
- **Ocultamiento preciso**: Si la celda marca `isFuture: true`, se le añadirá una clase CSS que aplique `visibility: hidden`. Esto la vuelve invisible, no interactiva, pero *mantiene intacto* su espacio (RF-1.4).
- **Delegación de eventos (Panel de detalle)**: Se añadirá un único escuchador de eventos (`pointerover` / `click` combinados) al padre contendor (el heatmap). Al detectar interacción con una celda real, tomará sus `dataset` y pintará los datos de forma inmediata en el elemento HTML destinado al panel fijo de detalle (RF-4.3).

---

## 5. Decisiones técnicas justificadas y alternativas descartadas

| Decisión tomada | Justificación | Alternativa descartada |
| --- | --- | --- |
| **Separar lógica pura a `heatmap.js`** | La constitución exige que las lógicas de fechas sean funciones puras testeables e independientes del DOM o `localStorage` (Principio 3 y 4). | Escribir los cálculos directamente en `app.js` dentro del proceso visual, inhabilitando el testeo por dependencias con el navegador. |
| **Generación con CSS Grid continuo** | Usar `grid-auto-flow: column` transforma una lista plana de 84 divs en 12 columnas exactas sin anidar HTML. Simple, limpio e imita la cuadrícula. | Agrupar el HTML en sub-divs (div por semana o tabla HTML). Descartado por excesiva complejidad domínica. |
| **Mecanismo de invisibilidad `visibility: hidden`** | Cumple perfectamente la directiva de la spec (RF-1.4): "mantener la alineación vertical sin romper la cuadrícula" si el hoy no es domingo. | Usar `display: none` o no generar las celdas futuras. Esto descuadraría el layout vertical en la semana incompleta. |
| **Exportación CommonJS condicional para Node** | En `heatmap.js` se añadirá `if (typeof module !== 'undefined') module.exports = {...}` para permitir importar el código puro sin romper el frontend estático. | Usar módulos ECMAScript (`type="module"`), lo que violaría el requisito de poder correr abriendo index.html en local file:// (Principio 1). |

---

## 6. Estrategia de tests puros (`node --test`)

Creación de una suite automatizada nativa de Node para probar la pureza de `heatmap.js` (cubriendo los RNF-4).

1. **Test de dimensiones (RF-1.2)**: Proveer una fecha "hoy" al azar y certificar que la salida tiene invariablemente *length = 84*.
2. **Test asimétrico (lunes frente a domingo) (RF-1.4)**:
   - "Hoy" inyectado es lunes: verificar que las últimas 6 celdas devuelven `isFuture = true`.
   - "Hoy" inyectado es domingo: verificar que las últimas 0 celdas devuelven `isFuture = true`.
3. **Test de agregación de múltiples sesiones (RF-2.1 y RF-3.5)**: Proveer tres sesiones en un mismo día; validar que en el array devuelto la celda correspondiente suma la totalidad y arroja el `level` correcto.
4. **Test exclusión de sesiones futuras y antiguas (RF-2.3)**: Simular sesiones del año que viene y de hace un año, certificando que los valores reportados en la matriz son 0.
5. **Test de resiliencia de datos (RF-2.4)**: Comprobar que minutos "null", strings o valores negativos no rompen la pureza e imputan 0 a la métrica.
