// Módulo de lógica pura para el Objetivo Semanal de Estudio
// Cumple estrictamente con docs/constitution.md:
// - Funciones puras desacopladas del DOM y localStorage
// - Fechas manejadas siempre con componentes locales (sin toISOString)

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getWeekRange(today) {
    const ref = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
    const dayOfWeek = ref.getDay(); // 0 es Domingo, 1 es Lunes... 6 es Sábado
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(ref);
    monday.setDate(ref.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        startStr: formatLocalDate(monday),
        endStr: formatLocalDate(sunday)
    };
}

function validateGoalInput(inputValue) {
    if (inputValue === null || inputValue === undefined) {
        return { valid: false, minutes: null, error: 'Introduce un número válido de minutos.' };
    }

    const trimmed = String(inputValue).trim();
    if (trimmed === '') {
        return { valid: false, minutes: null, error: 'El objetivo no puede estar vacío.' };
    }

    const num = Number(trimmed);
    if (!Number.isInteger(num)) {
        return { valid: false, minutes: null, error: 'El objetivo debe ser un número entero.' };
    }

    if (num <= 0) {
        return { valid: false, minutes: null, error: 'El objetivo debe ser mayor a 0 minutos.' };
    }

    if (num > 10080) { // 7 días * 24 horas * 60 minutos
        return { valid: false, minutes: null, error: 'El objetivo no puede superar los 10080 minutos semanales.' };
    }

    return { valid: true, minutes: num, error: null };
}

const DEFAULT_WEEKLY_GOAL_MINUTES = 300;

function calculateWeeklyProgress(sessions, goalMinutes, today) {
    const effectiveGoal = (typeof goalMinutes === 'number' && goalMinutes > 0)
        ? goalMinutes
        : DEFAULT_WEEKLY_GOAL_MINUTES;

    const range = getWeekRange(today);
    const todayStr = formatLocalDate(today);

    let currentMinutes = 0;

    if (Array.isArray(sessions)) {
        for (const session of sessions) {
            if (!session || typeof session.date !== 'string') continue;

            // Debe pertenecer a la semana actual y no ser fecha futura respecto a hoy
            if (session.date >= range.startStr && session.date <= range.endStr && session.date <= todayStr) {
                const mins = Number(session.minutes);
                if (!Number.isNaN(mins) && mins > 0) {
                    currentMinutes += mins;
                }
            }
        }
    }

    const percentage = Math.round((currentMinutes / effectiveGoal) * 100);
    const isCompleted = currentMinutes >= effectiveGoal;
    const remainingMinutes = Math.max(0, effectiveGoal - currentMinutes);
    const extraMinutes = Math.max(0, currentMinutes - effectiveGoal);

    return {
        currentMinutes,
        goalMinutes: effectiveGoal,
        percentage,
        isCompleted,
        remainingMinutes,
        extraMinutes,
        weekRange: range
    };
}

// Exportación condicional para compatibilidad dual:
// - Node.js (tests nativos con node --test)
// - Navegador directo file:// sin módulos ES
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEFAULT_WEEKLY_GOAL_MINUTES,
        formatLocalDate,
        getWeekRange,
        validateGoalInput,
        calculateWeeklyProgress
    };
}
