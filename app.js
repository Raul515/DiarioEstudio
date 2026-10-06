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

// Elementos del objetivo semanal
const weeklyGoalCard = document.getElementById('weekly-goal-card');
const goalEditBtn = document.getElementById('goal-edit-btn');
const goalDisplay = document.getElementById('goal-display');
const goalCurrentText = document.getElementById('goal-current-text');
const goalTargetText = document.getElementById('goal-target-text');
const goalPercentageBadge = document.getElementById('goal-percentage-badge');
const goalProgressFill = document.getElementById('goal-progress-fill');
const goalProgressBar = document.querySelector('.goal-progress-bar');
const goalStatusMessage = document.getElementById('goal-status-message');
const goalEditForm = document.getElementById('goal-edit-form');
const goalInput = document.getElementById('goal-input');
const goalCancelBtn = document.getElementById('goal-cancel-btn');
const goalErrorMsg = document.getElementById('goal-error-msg');

// Claves de almacenamiento (clave oficial de AGENTS.md y compatibilidad con versiones previas)
const STORAGE_KEY = 'diario-estudio-sesiones';
const LEGACY_STORAGE_KEY = 'diario_estudio_sessions';
const STORAGE_KEY_GOAL = 'diario-estudio-meta-semanal';

// Estado de la aplicación
let sessions = [];
let weeklyGoalMinutes = 300;

// Inicialización de la aplicación
function init() {
    // Establecer fecha por defecto a hoy en hora local
    const today = new Date();
    dateInput.value = formatDate(today);

    // Cargar sesiones guardadas y meta semanal
    loadData();
    loadGoal();

    // Configurar eventos interactivos
    setupHeatmapEvents();
    setupGoalEvents();
    setupSessionEvents();

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
    renderWeeklyGoal();
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
        li.dataset.id = session.id;

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
            <div class="session-actions">
                <button type="button" class="action-btn edit-btn" data-id="${session.id}" title="Editar sesión" aria-label="Editar sesión">✏️</button>
                <button type="button" class="action-btn delete-btn" data-id="${session.id}" title="Eliminar sesión" aria-label="Eliminar sesión">🗑️</button>
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
                let needsSave = false;
                sessions = parsed.map((item, index) => {
                    let id = item.id;
                    if (!id) {
                        id = (Date.now() + index).toString() + Math.random().toString(36).substring(2, 6);
                        needsSave = true;
                    }
                    return {
                        id,
                        date: item.date,
                        topic: item.topic || item.subject || '',
                        minutes: Number(item.minutes) || 0
                    };
                });
                if (needsSave) {
                    saveData();
                }
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

// Cargar objetivo semanal de localStorage
function loadGoal() {
    const raw = localStorage.getItem(STORAGE_KEY_GOAL);
    if (raw !== null) {
        const num = Number(raw);
        if (Number.isInteger(num) && num > 0 && num <= 10080) {
            weeklyGoalMinutes = num;
            return;
        }
    }
    weeklyGoalMinutes = (typeof DEFAULT_WEEKLY_GOAL_MINUTES === 'number') ? DEFAULT_WEEKLY_GOAL_MINUTES : 300;
}

// Guardar objetivo semanal en localStorage
function saveGoal(minutes) {
    weeklyGoalMinutes = minutes;
    localStorage.setItem(STORAGE_KEY_GOAL, minutes.toString());
}

// Renderizar la tarjeta del objetivo semanal
function renderWeeklyGoal() {
    if (!weeklyGoalCard) return;

    const today = new Date();
    const progress = (typeof calculateWeeklyProgress === 'function')
        ? calculateWeeklyProgress(sessions, weeklyGoalMinutes, today)
        : { currentMinutes: 0, goalMinutes: weeklyGoalMinutes, percentage: 0, isCompleted: false, remainingMinutes: weeklyGoalMinutes, extraMinutes: 0 };

    if (goalCurrentText) goalCurrentText.textContent = `${progress.currentMinutes} min`;
    if (goalTargetText) goalTargetText.textContent = `${progress.goalMinutes} min`;
    if (goalPercentageBadge) goalPercentageBadge.textContent = `${progress.percentage}%`;

    const clampedPercentage = Math.min(100, Math.max(0, progress.percentage));
    if (goalProgressFill) {
        goalProgressFill.style.width = `${clampedPercentage}%`;
    }
    if (goalProgressBar) {
        goalProgressBar.setAttribute('aria-valuenow', progress.percentage);
    }

    if (progress.isCompleted) {
        weeklyGoalCard.classList.add('goal-completed');
        if (goalStatusMessage) {
            if (progress.extraMinutes > 0) {
                goalStatusMessage.textContent = `¡Objetivo cumplido! Has superado tu meta por ${progress.extraMinutes} min.`;
            } else {
                goalStatusMessage.textContent = '¡Enhorabuena! Has alcanzado exactamente tu objetivo semanal.';
            }
        }
    } else {
        weeklyGoalCard.classList.remove('goal-completed');
        if (goalStatusMessage) {
            goalStatusMessage.textContent = `Te faltan ${progress.remainingMinutes} min para cumplir tu objetivo.`;
        }
    }
}

// Configurar eventos de edición del objetivo semanal
function setupGoalEvents() {
    if (!goalEditBtn || !goalEditForm) return;

    goalEditBtn.addEventListener('click', () => {
        if (goalInput) goalInput.value = weeklyGoalMinutes;
        if (goalErrorMsg) {
            goalErrorMsg.style.display = 'none';
            goalErrorMsg.textContent = '';
        }
        if (goalDisplay) goalDisplay.style.display = 'none';
        goalEditBtn.style.display = 'none';
        goalEditForm.style.display = 'block';
        if (goalInput) {
            goalInput.focus();
            goalInput.select();
        }
    });

    if (goalCancelBtn) {
        goalCancelBtn.addEventListener('click', () => {
            goalEditForm.style.display = 'none';
            if (goalDisplay) goalDisplay.style.display = 'block';
            goalEditBtn.style.display = 'inline-block';
            if (goalErrorMsg) goalErrorMsg.style.display = 'none';
        });
    }

    goalEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawValue = goalInput ? goalInput.value : '';
        const validation = (typeof validateGoalInput === 'function')
            ? validateGoalInput(rawValue)
            : { valid: Number.isInteger(Number(rawValue)) && Number(rawValue) > 0, minutes: Number(rawValue), error: 'Número no válido' };

        if (!validation.valid) {
            if (goalErrorMsg) {
                goalErrorMsg.textContent = validation.error;
                goalErrorMsg.style.display = 'block';
            }
            return;
        }

        saveGoal(validation.minutes);
        renderWeeklyGoal();

        goalEditForm.style.display = 'none';
        if (goalDisplay) goalDisplay.style.display = 'block';
        goalEditBtn.style.display = 'inline-block';
        if (goalErrorMsg) goalErrorMsg.style.display = 'none';
    });
}

// Configurar eventos de interacción para editar y eliminar sesiones
function setupSessionEvents() {
    if (!sessionsContainer) return;

    // Delegación de clics en la lista de sesiones
    sessionsContainer.addEventListener('click', (e) => {
        // Eliminar sesión
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            const session = sessions.find(s => s.id === id);
            const topicName = session ? (session.topic || 'esta sesión') : 'esta sesión';
            if (confirm(`¿Estás seguro de que deseas eliminar la sesión "${topicName}"?`)) {
                sessions = sessions.filter(s => s.id !== id);
                saveData();
                updateUI();
            }
            return;
        }

        // Entrar en modo edición
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const id = editBtn.dataset.id;
            const session = sessions.find(s => s.id === id);
            if (!session) return;

            const li = editBtn.closest('.session-item');
            if (!li) return;

            const topicText = session.topic || session.subject || '';

            li.innerHTML = `
                <form class="inline-edit-form" data-id="${session.id}">
                    <input type="text" name="topic" id="edit-topic-${session.id}" class="edit-topic" value="${escapeHTML(topicText)}" required placeholder="Tema de estudio" aria-label="Tema de estudio" />
                    <input type="number" name="minutes" id="edit-minutes-${session.id}" class="edit-minutes" value="${session.minutes}" min="1" required placeholder="Minutos" aria-label="Minutos de estudio" />
                    <div class="inline-edit-actions">
                        <button type="submit" class="save-btn">Guardar</button>
                        <button type="button" class="cancel-btn">Cancelar</button>
                    </div>
                </form>
            `;

            const topicInput = li.querySelector('.edit-topic');
            if (topicInput) {
                topicInput.focus();
                topicInput.select();
            }
            return;
        }

        // Cancelar edición
        const cancelBtn = e.target.closest('.cancel-btn');
        if (cancelBtn) {
            renderSessions();
            return;
        }
    });

    // Delegación de envío del formulario de edición en línea
    sessionsContainer.addEventListener('submit', (e) => {
        const form = e.target.closest('.inline-edit-form');
        if (!form) return;

        e.preventDefault();
        const id = form.dataset.id;
        const topicInput = form.querySelector('.edit-topic');
        const minutesInput = form.querySelector('.edit-minutes');

        if (!topicInput || !minutesInput) return;

        const newTopic = topicInput.value.trim();
        const newMinutes = parseInt(minutesInput.value, 10);

        if (!newTopic) {
            alert('El tema no puede estar vacío.');
            topicInput.focus();
            return;
        }

        if (isNaN(newMinutes) || newMinutes <= 0) {
            alert('Los minutos deben ser un número entero mayor que 0.');
            minutesInput.focus();
            return;
        }

        const sessionIndex = sessions.findIndex(s => s.id === id);
        if (sessionIndex !== -1) {
            sessions[sessionIndex].topic = newTopic;
            sessions[sessionIndex].minutes = newMinutes;
            saveData();
            updateUI();
        }
    });
}

// Arrancar
init();

