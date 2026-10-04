// Elementos del DOM
const form = document.getElementById('session-form');
const dateInput = document.getElementById('date');
const subjectInput = document.getElementById('subject');
const minutesInput = document.getElementById('minutes');
const sessionsContainer = document.getElementById('sessions-container');
const streakCount = document.getElementById('streak-count');
const bestStreakCount = document.getElementById('best-streak-count');
const monthDaysCount = document.getElementById('month-days-count');
const heatmapGrid = document.getElementById('heatmap-grid');
const heatmapInfo = document.getElementById('heatmap-info');

// Claves de almacenamiento (clave oficial de AGENTS.md y compatibilidad con versiones previas)
const STORAGE_KEY = 'diario-estudio-sesiones';
const LEGACY_STORAGE_KEY = 'diario_estudio_sessions';

// Estado de la aplicación
let sessions = [];

// Inicialización de la aplicación
function init() {
    // Establecer fecha por defecto a hoy en hora local
    const today = new Date();
    dateInput.value = formatDate(today);

    // Cargar sesiones guardadas
    loadData();

    // Configurar eventos interactivos del mapa
    setupHeatmapEvents();

    // Renderizar la interfaz
    updateUI();
}

// Evento al enviar el formulario
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const newSession = {
        id: Date.now().toString(),
        date: dateInput.value, // Formato AAAA-MM-DD
        topic: subjectInput.value.trim(),
        minutes: parseInt(minutesInput.value, 10)
    };

    sessions.push(newSession);
    saveData();
    updateUI();

    // Limpiar campos de texto manteniendo la fecha para facilitar registros múltiples
    subjectInput.value = '';
    minutesInput.value = '';
    subjectInput.focus();
});

// Actualizar toda la interfaz de usuario
function updateUI() {
    renderSessions();
    renderStreaks();
    renderHeatmap();
}

// Renderizar el mapa de calor de 12 semanas
function renderHeatmap() {
    if (!heatmapGrid || !heatmapInfo) return;

    heatmapGrid.innerHTML = '';
    const today = new Date();
    // generateHeatmapData proviene de heatmap.js
    const cells = typeof generateHeatmapData === 'function' ? generateHeatmapData(sessions, today) : [];

    const todayStr = formatDate(today);
    const todayCell = cells.find(c => c.dateStr === todayStr);
    const defaultText = todayCell
        ? `Hoy (${todayCell.displayDate}): ${todayCell.minutes} minutos`
        : 'Hoy: 0 minutos';

    heatmapInfo.textContent = defaultText;

    cells.forEach(cell => {
        const div = document.createElement('div');
        div.className = `heatmap-cell level-${cell.level}`;
        if (cell.isFuture) {
            div.classList.add('hidden-future');
        } else {
            div.dataset.date = cell.dateStr;
            div.dataset.display = cell.displayDate;
            div.dataset.minutes = cell.minutes;
            div.setAttribute('role', 'gridcell');
            div.setAttribute('aria-label', `${cell.displayDate}: ${cell.minutes} minutos`);
            div.tabIndex = 0;
        }
        heatmapGrid.appendChild(div);
    });
}

// Configurar delegación de eventos para el detalle informativo del mapa
function setupHeatmapEvents() {
    if (!heatmapGrid || !heatmapInfo) return;

    function showCellDetail(cell) {
        if (!cell || cell.classList.contains('hidden-future')) return;
        const display = cell.dataset.display;
        const minutes = cell.dataset.minutes;
        if (display && minutes !== undefined) {
            heatmapInfo.textContent = `${display}: ${minutes} minutos`;
        }
    }

    function resetToToday() {
        const today = new Date();
        const todayStr = formatDate(today);
        const cell = heatmapGrid.querySelector(`[data-date="${todayStr}"]`);
        if (cell) {
            heatmapInfo.textContent = `Hoy (${cell.dataset.display}): ${cell.dataset.minutes} minutos`;
        } else {
            heatmapInfo.textContent = 'Hoy: 0 minutos';
        }
    }

    // Interacción con ratón o táctil
    heatmapGrid.addEventListener('pointerover', (e) => {
        const cell = e.target.closest('.heatmap-cell:not(.hidden-future)');
        if (cell) {
            showCellDetail(cell);
        }
    });

    heatmapGrid.addEventListener('pointerout', (e) => {
        if (!e.relatedTarget || !heatmapGrid.contains(e.relatedTarget)) {
            resetToToday();
        }
    });

    heatmapGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('.heatmap-cell:not(.hidden-future)');
        if (cell) {
            showCellDetail(cell);
        }
    });

    // Accesibilidad por teclado
    heatmapGrid.addEventListener('focusin', (e) => {
        const cell = e.target.closest('.heatmap-cell:not(.hidden-future)');
        if (cell) {
            showCellDetail(cell);
        }
    });

    heatmapGrid.addEventListener('focusout', (e) => {
        if (!e.relatedTarget || !heatmapGrid.contains(e.relatedTarget)) {
            resetToToday();
        }
    });
}

// Pintar la lista de sesiones
function renderSessions() {
    sessionsContainer.innerHTML = '';

    if (sessions.length === 0) {
        sessionsContainer.innerHTML = '<li class="empty-state">No hay sesiones registradas aún. ¡Empieza hoy!</li>';
        return;
    }

    // Ordenar de más reciente a más antigua
    const sortedSessions = [...sessions].sort((a, b) => {
        if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
        }
        return (b.id || 0) - (a.id || 0);
    });

    sortedSessions.forEach(session => {
        const li = document.createElement('li');
        li.className = 'session-item';

        // Formatear la fecha para mostrar en formato legible DD/MM/AAAA
        const [year, month, day] = session.date.split('-');
        const displayDate = `${day}/${month}/${year}`;
        const topicText = session.topic || session.subject || 'Sin tema';

        li.innerHTML = `
            <div class="session-info">
                <strong>${escapeHTML(topicText)}</strong>
                <span>${displayDate}</span>
            </div>
            <div class="session-minutes">
                ${session.minutes} min
            </div>
        `;

        sessionsContainer.appendChild(li);
    });
}

// Calcular y mostrar racha actual, mejor racha y días estudiados este mes
function renderStreaks() {
    const { current, best } = calculateStreaks();
    streakCount.textContent = current;
    bestStreakCount.textContent = best;
    monthDaysCount.textContent = calculateMonthDays();
}

// Calcular días únicos estudiados en el mes local actual (excluyendo fechas futuras)
function calculateMonthDays() {
    if (sessions.length === 0) {
        return 0;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${year}-${month}-`;
    const todayStr = formatDate(today);

    const uniqueMonthDays = new Set(
        sessions
            .filter(session => typeof session.date === 'string' && session.date.startsWith(monthPrefix) && session.date <= todayStr)
            .map(session => session.date)
    );

    return uniqueMonthDays.size;
}

// Lógica de cálculo de rachas
function calculateStreaks() {
    if (sessions.length === 0) {
        return { current: 0, best: 0 };
    }

    const today = new Date();
    const todayStr = formatDate(today);

    // 1. Obtener días únicos con sesión que no sean futuros, ordenados cronológicamente
    const uniqueDates = [...new Set(sessions.map(s => s.date))]
        .filter(date => date <= todayStr)
        .sort((a, b) => a.localeCompare(b));

    if (uniqueDates.length === 0) {
        return { current: 0, best: 0 };
    }

    // 2. Calcular la mejor racha histórica
    let best = 1;
    let runningStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
        const previousDate = parseLocalDate(uniqueDates[i - 1]);
        const nextExpected = addDays(previousDate, 1);
        const nextExpectedStr = formatDate(nextExpected);

        if (uniqueDates[i] === nextExpectedStr) {
            runningStreak++;
        } else {
            runningStreak = 1;
        }

        if (runningStreak > best) {
            best = runningStreak;
        }
    }

    // 3. Calcular la racha actual (días consecutivos que terminan hoy o ayer)
    const yesterday = addDays(today, -1);
    const yesterdayStr = formatDate(yesterday);
    const lastStudiedDate = uniqueDates[uniqueDates.length - 1];

    let current = 0;

    // Solo está activa si la última sesión fue hoy o ayer
    if (lastStudiedDate === todayStr || lastStudiedDate === yesterdayStr) {
        let checkDate = parseLocalDate(lastStudiedDate);

        // Contar hacia atrás de forma consecutiva
        for (let i = uniqueDates.length - 1; i >= 0; i--) {
            const expectedStr = formatDate(checkDate);
            if (uniqueDates[i] === expectedStr) {
                current++;
                checkDate = addDays(checkDate, -1);
            } else {
                break;
            }
        }
    }

    // La mejor racha siempre debe ser al menos igual a la racha actual
    best = Math.max(best, current);

    return { current, best };
}

// Cargar datos de localStorage con retrocompatibilidad
function loadData() {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }

    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                sessions = parsed.map(item => ({
                    id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 6),
                    date: item.date,
                    topic: item.topic || item.subject || '',
                    minutes: Number(item.minutes) || 0
                }));
            }
        } catch (e) {
            console.error('Error al cargar datos:', e);
            sessions = [];
        }
    }
}

// Guardar datos en localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// Formatear Date en AAAA-MM-DD respetando la zona local
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Crear Date a las 12:00 del mediodía local para evitar desfases de horario de verano/invierno
function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
}

// Sumar o restar días a una fecha local
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Escapar texto para prevenir inyección de código
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Arrancar
init();
