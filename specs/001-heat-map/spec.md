# Especificación: Mapa de Calor de Hábitos de Estudio (001-heat-map)

## 1. Contexto y objetivo

### 1.1 Contexto
El Diario de Estudio permite a los usuarios registrar sus sesiones diarias de estudio y monitorear su racha de días consecutivos. Sin embargo, actualmente las métricas solo reflejan el conteo numérico de días y un historial en formato lista, lo que dificulta percibir a simple vista el esfuerzo dedicado a lo largo del tiempo o la regularidad acumulada en periodos recientes.

### 1.2 Objetivo
Proporcionar una representación visual compacta e intuitiva (mapa de calor estilo cuadrícula temporal) que muestre la constancia y el volumen de estudio (minutos) de las últimas 12 semanas hasta el día actual. Esto refuerza la motivación y permite al usuario detectar patrones de dedicación y semanas de mayor o menor intensidad.

---

## 2. Usuarios

- **Estudiante / Autodidacta**: Persona que utiliza la aplicación para registrar su tiempo de estudio diario y busca un refuerzo visual inmediato de su consistencia y esfuerzo sin fricciones ni configuraciones complejas.

---

## 3. Historias de usuario

- **HU-1 (Visualización global del hábito)**: Como estudiante, quiero ver una cuadrícula ordenada de 12 semanas que termine en el día de hoy para identificar de un vistazo mi regularidad en el tiempo.
- **HU-2 (Intensidad según esfuerzo)**: Como estudiante, quiero que cada día tenga una tonalidad según el total de minutos estudiados para distinguir las jornadas ligeras de las de dedicación profunda.
- **HU-3 (Consulta de detalle sin fricción)**: Como estudiante, quiero consultar la fecha exacta y los minutos acumulados de un día específico (al pasar el ratón o pulsar en móvil) mediante un panel de texto visible y legible, sin que elementos flotantes tapen la vista.
- **HU-4 (Enfoque en lo transcurrido)**: Como estudiante, quiero que la visualización finalice en el día de hoy sin mostrar celdas para días futuros, manteniendo el foco estrictamente en lo ya logrado.

---

## 4. Requisitos funcionales

### RF-1: Generación de la matriz temporal de 12 semanas
El sistema debe calcular y representar una cuadrícula estructurada de exactamente 12 semanas consecutivas (columnas) organizadas de lunes a domingo (filas), concluyendo en la fecha local de referencia («hoy»).

- **Criterio de aceptación 1.1 (EARS Ubicuo)**: El sistema debe estructurar la cuadrícula en 7 filas fijas, donde cada fila corresponde a un día de la semana (de lunes en la fila superior a domingo en la fila inferior).
- **Criterio de aceptación 1.2 (EARS Ubicuo)**: El sistema debe calcular exactamente 12 columnas semanales consecutivas de izquierda a derecha, donde la primera columna inicia el lunes de hace 11 semanas y la columna número 12 corresponde a la semana en curso.
- **Criterio de aceptación 1.3 (EARS Ubicuo - Principio 3)**: El cálculo de la matriz temporal debe recibir la fecha de referencia («hoy») como parámetro explícito y basarse en los componentes de fecha local del usuario.
- **Criterio de aceptación 1.4 (EARS Evento / Casos límite de fin de semana)**:
  - CUANDO el día de hoy sea domingo, la columna 12 debe mostrar las 7 celdas activas correspondientes de lunes a domingo.
  - CUANDO el día de hoy sea anterior al domingo (de lunes a sábado), la columna 12 debe mostrar únicamente las celdas desde el lunes hasta hoy inclusive, dejando los espacios correspondientes a días futuros ocultos/no interactivos para preservar la alineación vertical de las filas sin romper la cuadrícula.

### RF-2: Agregación y depuración de minutos por fecha
El sistema debe sumarizar el volumen de estudio diario a partir de las sesiones disponibles.

- **Criterio de aceptación 2.1 (EARS Ubicuo)**: El sistema debe sumar los minutos de todas las sesiones registradas cuya fecha coincida exactamente con cada día del mapa.
- **Criterio de aceptación 2.2 (EARS Opcional)**: DONDE una fecha comprendida en la matriz no posea sesiones registradas, el sistema debe asignarle un total de 0 minutos.
- **Criterio de aceptación 2.3 (EARS Excepción - Fechas futuras y fuera de rango)**: SI existen sesiones registradas con fecha posterior a hoy o anterior a la fecha de inicio del mapa (lunes de la semana 1), ENTONCES el sistema debe omitirlas en el cálculo del mapa de calor, preservando la fidelidad del rango visible.
- **Criterio de aceptación 2.4 (EARS Excepción - Robustez de datos)**: SI una sesión contiene minutos negativos, nulos, no numéricos o vacíos, ENTONCES el sistema debe contabilizar 0 minutos para dicho registro sin interrumpir el cálculo.

### RF-3: Asignación de niveles fijos de intensidad
El sistema debe clasificar cada día representado en uno de 5 niveles discretos de intensidad de color según el total de minutos sumados en esa fecha.

- **Criterio de aceptación 3.1 (EARS Estado)**: MIENTRAS una fecha acumule exactamente 0 minutos, el sistema debe asignarle el **Nivel 0** (estado vacío/sin rellenar).
- **Criterio de aceptación 3.2 (EARS Estado)**: MIENTRAS una fecha acumule entre 1 y 29 minutos (ambos inclusive), el sistema debe asignarle el **Nivel 1**.
- **Criterio de aceptación 3.3 (EARS Estado)**: MIENTRAS una fecha acumule entre 30 y 59 minutos (ambos inclusive), el sistema debe asignarle el **Nivel 2**.
- **Criterio de aceptación 3.4 (EARS Estado)**: MIENTRAS una fecha acumule entre 60 y 119 minutos (ambos inclusive), el sistema debe asignarle el **Nivel 3**.
- **Criterio de aceptación 3.5 (EARS Estado)**: MIENTRAS una fecha acumule 120 o más minutos, el sistema debe asignarle el **Nivel 4** (máxima intensidad).

### RF-4: Panel de detalle e interacción unificada (escritorio y móvil)
Para garantizar accesibilidad tanto con ratón como en pantallas táctiles, el sistema debe disponer de un área de información fija vinculada a la cuadrícula.

- **Criterio de aceptación 4.1 (EARS Ubicuo)**: El sistema debe mostrar un panel de información textual directamente contiguo (debajo) a la cuadrícula del mapa.
- **Criterio de aceptación 4.2 (EARS Estado)**: MIENTRAS no haya ninguna celda seleccionada o interactuada, el panel de información debe mostrar el resumen del día de hoy con el formato: `Hoy ([Nombre del día], D de [Mes] de AAAA): X minutos` (o `0 minutos` si no se ha estudiado hoy).
- **Criterio de aceptación 4.3 (EARS Evento)**: CUANDO el usuario interactúe con cualquier celda visible (mediante `hover` con cursor o `tap`/clic táctil), el panel de información debe actualizarse inmediatamente mostrando la fecha y los minutos de dicha celda con el formato: `[Nombre del día], D de [Mes] de AAAA: X minutos`.
- **Criterio de aceptación 4.4 (EARS Ubicuo)**: La interacción con las celdas debe ser meramente de consulta y en ningún caso debe filtrar el listado inferior ni disparar acciones de edición o borrado.

### RF-5: Actualización reactiva e inmediata
- **Criterio de aceptación 5.1 (EARS Evento)**: CUANDO el usuario agregue una nueva sesión mediante el formulario existente, el sistema debe recalcular y redibujar inmediatamente el mapa de calor y el panel de detalle sin recargar la página.

---

## 5. Requisitos no funcionales

- **RNF-1 (Accesibilidad y diferenciación cromática)**: Los 5 niveles de intensidad deben presentar una escala tonal armónica y contrastes claramente diferenciables sobre el fondo de la aplicación, identificando sin esfuerzo las celdas con actividad respecto a las celdas vacías (Nivel 0).
- **RNF-2 (Diseño adaptativo móvil hasta 375 px)**: La cuadrícula de 12 columnas debe ser completamente legible en pantallas móviles estrechas (ancho de 375 px). Si las proporciones de las celdas requieren un ancho mayor al disponible, el contenedor del mapa debe permitir desplazamiento horizontal suave y contenido sin desbordar el resto de la interfaz.
- **RNF-3 (Textos e idioma)**: Todos los nombres de días, meses y etiquetas deben expresarse en español de acuerdo a las directrices de la aplicación.
- **RNF-4 (Verificabilidad pura / Tests unitarios)**: La lógica de generación de la matriz de 12 semanas (fechas, minutos acumulados y niveles asignados) debe ser una función pura comprobable con `node --test` mediante inyección del parámetro `today` sin interacción con el DOM ni `localStorage`.

---

## 6. Casos límite

1. **Estado inicial sin sesiones guardadas**:
   - Todas las celdas visibles de las 12 semanas se renderizan en Nivel 0. El panel de detalle muestra `Hoy (...): 0 minutos`.
2. **Día actual es lunes**:
   - La semana 12 (última columna) muestra únicamente la celda superior (lunes). Las 6 filas restantes de dicha columna permanecen ocultas e inactivas.
3. **Día actual es domingo**:
   - La semana 12 muestra sus 7 celdas completas de lunes a domingo.
4. **Acumulación de múltiples sesiones el mismo día**:
   - Si existen 3 sesiones en la misma fecha de 20, 20 y 30 minutos (total 70 min), la celda adopta el Nivel 3 (60–119 min) y el panel indica `70 minutos`.
5. **Sesiones con fecha futura registradas por el usuario**:
   - Aparecen en la lista general de sesiones (según las reglas globales del proyecto), pero el mapa de calor las ignora por completo y nunca se representan más allá del día de hoy.
6. **Sesiones de más de 12 semanas de antigüedad**:
   - Se ignoran para el cálculo de la cuadrícula y no alteran los índices de las 12 columnas.
7. **Paso de medianoche**:
   - El mapa se actualiza con la fecha del día en que se carga o cuando el usuario registra una sesión. No se requiere un temporizador en segundo plano para forzar el cambio a las 00:00.

---

## 7. Fuera de alcance

- Leyenda estática de niveles de intensidad (descartada para mantener un diseño limpio).
- Filtros por materia o tema de estudio.
- Configuración de rangos temporales personalizados (número variable de semanas o meses).
- Acciones de edición, borrado o filtrado disparadas desde la cuadrícula del mapa.
- Exportación o descarga del mapa en formato gráfico o imagen.
- Ajuste dinámico de medianoche mediante temporizadores en segundo plano.

---

## 8. Criterios de finalización

La funcionalidad se considerará lista para producción cuando:
1. La cuadrícula muestre exactamente 12 semanas organizadas de lunes (arriba) a domingo (abajo).
2. Los días posteriores a hoy en la semana en curso no sean visibles ni interactivos.
3. Cada celda refleje fielmente su nivel de color (0 a 4) según los minutos acumulados en su fecha.
4. La interacción (en escritorio y en móvil táctil) actualice con precisión el panel de información contiguo mostrando la fecha en español y los minutos.
5. Los tests de lógica pura pasen al 100% con `node --test` cubriendo el cálculo de las 12 semanas, casos de lunes/domingo, agregación de minutos y casos borde.
6. La visualización sea completamente funcional y fluida en un viewport móvil de 375 px de ancho sin romper la maquetación.

---

## 9. Dudas abiertas

- *Ninguna*: Todas las ambigüedades geométricas, de interacción táctil, formatos de fecha, truncamiento de días futuros y pureza de cálculo han quedado resueltas y formalizadas.
