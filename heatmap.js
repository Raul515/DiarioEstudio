// Pure logic and utilities for the study diary heatmap

const SPANISH_DAYS = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
];

const SPANISH_MONTHS = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
];

/**
 * Format a Date object as YYYY-MM-DD in local time
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a local Date set at 12:00 noon
 * to avoid daylight saving time transitions.
 */
function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Add or subtract days to a Date object without mutating original
 */
function addDays(date, days) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Calculate intensity level based on fixed minute thresholds (0-4)
 */
function calculateLevel(minutes) {
    const mins = Number(minutes);
    if (isNaN(mins) || mins <= 0) {
        return 0;
    }
    if (mins < 30) {
        return 1;
    }
    if (mins < 60) {
        return 2;
    }
    if (mins < 120) {
        return 3;
    }
    return 4;
}

/**
 * Calculate the starting Monday 11 weeks before current week Monday
 */
function getStartDate(today) {
    const noonToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
    // JS getDay(): Sunday=0, Monday=1, ..., Saturday=6
    // Days from Monday of the current week:
    const daysSinceMonday = (noonToday.getDay() + 6) % 7;
    const currentWeekMonday = addDays(noonToday, -daysSinceMonday);
    // 11 weeks back = 11 * 7 = 77 days
    return addDays(currentWeekMonday, -77);
}

/**
 * Format a Date object to Spanish display string: "[Día], D de [mes] de AAAA"
 */
function formatDisplayDate(date) {
    const dayName = SPANISH_DAYS[date.getDay()];
    const day = date.getDate();
    const monthName = SPANISH_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} de ${monthName} de ${year}`;
}

/**
 * Generate 84 cells (12 weeks * 7 days) representing the heatmap grid
 */
function generateHeatmapData(sessions = [], today = new Date()) {
    const noonToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
    const todayStr = formatDate(noonToday);
    const startDate = getStartDate(noonToday);
    const startDateStr = formatDate(startDate);

    // Sum minutes per date
    const minutesByDate = {};
    if (Array.isArray(sessions)) {
        for (const session of sessions) {
            if (!session || typeof session.date !== 'string') {
                continue;
            }
            // Skip future sessions and sessions older than start date
            if (session.date > todayStr || session.date < startDateStr) {
                continue;
            }
            const mins = Number(session.minutes);
            if (!isNaN(mins) && mins > 0) {
                minutesByDate[session.date] = (minutesByDate[session.date] || 0) + mins;
            }
        }
    }

    const grid = [];
    // Exactly 12 weeks * 7 days = 84 cells
    for (let i = 0; i < 84; i++) {
        const currentDate = addDays(startDate, i);
        const dateStr = formatDate(currentDate);
        const minutes = minutesByDate[dateStr] || 0;
        const level = calculateLevel(minutes);
        const isFuture = dateStr > todayStr;
        const displayDate = formatDisplayDate(currentDate);

        grid.push({
            dateStr,
            displayDate,
            minutes,
            level,
            isFuture
        });
    }

    return grid;
}

// Export for Node.js testing environment (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        parseLocalDate,
        addDays,
        calculateLevel,
        getStartDate,
        formatDisplayDate,
        generateHeatmapData
    };
}
