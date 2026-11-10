// Pure logic for topic time statistics (weekly and monthly rankings)
// No DOM, no localStorage — pure functions only (Constitution rule 3)

var SPANISH_MONTHS_TOPIC = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

/**
 * Extract base topic and subtopic from a raw topic string.
 * Example: "Estudiar Teoria Sistemas Distribuidos (Tema 4)"
 *   -> { base: "Estudiar Teoria Sistemas Distribuidos", subtopic: "Tema 4" }
 * Example: "Ingles"
 *   -> { base: "Ingles", subtopic: null }
 * Example: "(Tema 1)"
 *   -> { base: "Tema 1", subtopic: null }
 * Example: "Tema ()"
 *   -> { base: "Tema", subtopic: null }
 */
function parseTopic(rawTopic) {
    if (typeof rawTopic !== 'string') {
        return { base: '', subtopic: null };
    }
    var trimmed = rawTopic.trim();
    if (!trimmed) {
        return { base: '', subtopic: null };
    }

    var match = trimmed.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
    if (match) {
        var basePart = match[1].trim();
        var subtopicPart = match[2].trim();

        // Edge case: only text inside parentheses e.g. "(Tema 1)"
        if (!basePart && subtopicPart) {
            return { base: subtopicPart, subtopic: null };
        }

        // Edge case: empty parentheses e.g. "Tema ()"
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

/**
 * Normalize a topic name for grouping:
 * lowercase, no diacritics, hyphens → spaces, collapse whitespace
 */
function normalizeTopic(name) {
    if (typeof name !== 'string') return '';
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

/**
 * Convert text to Title Case (first letter of each word capitalized)
 */
function toTitleCase(name) {
    if (typeof name !== 'string') return '';
    var cleaned = name
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    if (cleaned === '') return '';
    return cleaned.split(' ').map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

/**
 * Format minutes as readable duration:
 * < 60 → "45 min", >= 60 → "2h 30min" (or "2h" if exact)
 */
function formatDuration(minutes) {
    var mins = Math.floor(Number(minutes));
    if (isNaN(mins) || mins <= 0) return '0 min';
    if (mins < 60) return mins + ' min';
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (m > 0) return h + 'h ' + m + 'min';
    return h + 'h';
}

/**
 * Format a Date as AAAA-MM-DD using local components (never UTC)
 */
function formatLocalDateTS(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

/**
 * Get the week range (Mon–Sun) for a given offset from the current week.
 * offset=0 → current week, offset=-1 → previous week, etc.
 * Returns { startStr, endStr, label }
 */
function getWeekRangeForOffset(today, offset) {
    var ref = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
    var dayOfWeek = ref.getDay(); // 0=Sun, 1=Mon... 6=Sat
    var diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    var monday = new Date(ref);
    monday.setDate(ref.getDate() + diffToMonday + (offset * 7));

    var sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    var label = formatShortDate(monday) + ' – ' + formatShortDate(sunday);

    return {
        startStr: formatLocalDateTS(monday),
        endStr: formatLocalDateTS(sunday),
        label: label
    };
}

/**
 * Format date as "D mon AAAA" for week labels
 */
function formatShortDate(date) {
    var day = date.getDate();
    var monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    var month = monthNames[date.getMonth()];
    var year = date.getFullYear();
    return day + ' ' + month + ' ' + year;
}

/**
 * Get the month range for a given offset from the current month.
 * offset=0 → current month, offset=-1 → previous month, etc.
 * Returns { startStr, endStr, label }
 */
function getMonthRangeForOffset(today, offset) {
    var ref = new Date(today.getFullYear(), today.getMonth() + offset, 1, 12, 0, 0);
    var year = ref.getFullYear();
    var month = ref.getMonth();

    var firstDay = new Date(year, month, 1, 12, 0, 0);
    var lastDay = new Date(year, month + 1, 0, 12, 0, 0);

    // Capitalize first letter for the label
    var monthName = SPANISH_MONTHS_TOPIC[month];
    var label = monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + year;

    return {
        startStr: formatLocalDateTS(firstDay),
        endStr: formatLocalDateTS(lastDay),
        label: label
    };
}

/**
 * Build the topic ranking for a date range.
 * Groups by base topic (ignoring specifications in parentheses) and
 * calculates subtopics breakdown if 2 or more distinct subtopics exist.
 * Returns { topics: [{ displayName, totalMinutes, percentage, subtopics }], totalMinutes }
 */
function buildTopicRanking(sessions, startStr, endStr) {
    if (!Array.isArray(sessions) || sessions.length === 0) {
        return { topics: [], totalMinutes: 0 };
    }

    // Group minutes by normalized base topic, tracking subtopics
    var groups = {}; // baseKey → { totalMinutes, originalName, subtopicsMap }
    var totalMinutes = 0;

    for (var i = 0; i < sessions.length; i++) {
        var session = sessions[i];
        if (!session || typeof session.date !== 'string') continue;
        if (session.date < startStr || session.date > endStr) continue;

        var mins = Number(session.minutes);
        if (isNaN(mins) || mins <= 0) continue;

        var topicName = session.topic || session.subject || '';
        var parsed = parseTopic(topicName);
        var baseKey = normalizeTopic(parsed.base);
        if (baseKey === '') continue;

        totalMinutes += mins;

        if (!groups[baseKey]) {
            groups[baseKey] = {
                totalMinutes: 0,
                originalName: parsed.base,
                subtopicsMap: {}
            };
        }
        groups[baseKey].totalMinutes += mins;

        // Subtopic grouping
        var subKey = parsed.subtopic ? normalizeTopic(parsed.subtopic) : '__general__';
        var rawSubName = parsed.subtopic ? parsed.subtopic : 'General';

        if (!groups[baseKey].subtopicsMap[subKey]) {
            // Capitalize first character of display name
            var cleanSubName = rawSubName.charAt(0).toUpperCase() + rawSubName.slice(1);
            groups[baseKey].subtopicsMap[subKey] = {
                totalMinutes: 0,
                displayName: cleanSubName
            };
        }
        groups[baseKey].subtopicsMap[subKey].totalMinutes += mins;
    }

    // Build sorted array
    var topics = [];
    var keys = Object.keys(groups);
    for (var j = 0; j < keys.length; j++) {
        var k = keys[j];
        var group = groups[k];
        var percentage = totalMinutes > 0
            ? Math.round((group.totalMinutes / totalMinutes) * 100)
            : 0;

        // Build subtopics array
        var subKeys = Object.keys(group.subtopicsMap);
        var subtopics = [];

        // If the only subtopic is '__general__', there were no parentheses at all
        var hasOnlyGeneral = subKeys.length === 1 && subKeys[0] === '__general__';
        if (!hasOnlyGeneral && subKeys.length > 0) {
            for (var s = 0; s < subKeys.length; s++) {
                var sk = subKeys[s];
                var sub = group.subtopicsMap[sk];
                var subPercentage = group.totalMinutes > 0
                    ? Math.round((sub.totalMinutes / group.totalMinutes) * 100)
                    : 0;
                subtopics.push({
                    displayName: sub.displayName,
                    totalMinutes: sub.totalMinutes,
                    percentage: subPercentage
                });
            }
            // Sort subtopics descending by totalMinutes
            subtopics.sort(function (a, b) { return b.totalMinutes - a.totalMinutes; });
        }

        topics.push({
            displayName: toTitleCase(group.originalName),
            totalMinutes: group.totalMinutes,
            percentage: percentage,
            subtopics: subtopics
        });
    }

    // Sort descending by totalMinutes
    topics.sort(function (a, b) { return b.totalMinutes - a.totalMinutes; });

    return { topics: topics, totalMinutes: totalMinutes };
}

// Conditional export for Node.js tests (Constitution rule 4)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseTopic: parseTopic,
        normalizeTopic: normalizeTopic,
        toTitleCase: toTitleCase,
        formatDuration: formatDuration,
        formatLocalDateTS: formatLocalDateTS,
        getWeekRangeForOffset: getWeekRangeForOffset,
        getMonthRangeForOffset: getMonthRangeForOffset,
        formatShortDate: formatShortDate,
        buildTopicRanking: buildTopicRanking
    };
}
