# Diario de Estudio

Aplicación web minimalista para registrar sesiones de estudio diarias y mantenerse motivado visualizando la racha de días consecutivos.

Proyecto didáctico con código limpio y directo, ideal para quienes se inician en la programación web.

## Características

- **Registro de sesiones**: Fecha (editable), tema y duración en minutos.
- **Racha actual (🔥)**: Días consecutivos de estudio terminados hoy (sigue viva si estudiaste ayer).
- **Mejor racha (🏆)**: Récord histórico de días seguidos con sesión, calculado dinámicamente.
- **Historial ordenado**: Sesiones de más reciente a más antigua.
- **Persistencia local**: Datos guardados automáticamente en `localStorage`.
- **Diseño responsive**: Adaptado para ordenador y móviles sin librerías externas.

## Pila tecnológica

- **HTML5**: Estructura semántica accesible.
- **CSS3 Vanilla**: Estilos limpios con variables CSS y Flexbox/Grid.
- **JavaScript Vanilla (ES6+)**: Lógica, cálculo de fechas locales y persistencia sin frameworks ni herramientas de build.

## Cómo usar

1. Clona o descarga este repositorio.
2. Abre `index.html` con doble clic en tu navegador web (`file://`).
3. No requiere servidor local, Node.js ni instalación de dependencias.

## Estructura de archivos

- `index.html`: Estructura y formulario de entrada.
- `styles.css`: Estilos visuales y diseño adaptable.
- `app.js`: Lógica de negocio, cálculo de rachas y persistencia.
- `AGENTS.md`: Directrices y convenciones del proyecto para agentes de IA.
- `MEMORY.md`: Registro de estado, decisiones y memoria entre sesiones.
