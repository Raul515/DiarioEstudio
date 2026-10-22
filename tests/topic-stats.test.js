var test = require('node:test');
var assert = require('node:assert/strict');
var {
    normalizeTopic,
    toTitleCase,
    formatDuration,
    getWeekRangeForOffset,
    getMonthRangeForOffset,
    buildTopicRanking
} = require('../topic-stats.js');

// --- normalizeTopic ---

test('normalizeTopic - casing and diacritics', async function (t) {
    await t.test('ignores case', function () {
        assert.equal(normalizeTopic('Inglés'), normalizeTopic('INGLÉS'));
        assert.equal(normalizeTopic('Inglés'), normalizeTopic('inglés'));
    });

    await t.test('removes diacritics', function () {
        assert.equal(normalizeTopic('Matemáticas'), normalizeTopic('Matematicas'));
        assert.equal(normalizeTopic('MATEMÁTICAS'), normalizeTopic('matematicas'));
    });

    await t.test('normalizes hyphens to spaces', function () {
        assert.equal(
            normalizeTopic('Standford Auto-Improving Agents'),
            normalizeTopic('Standford Auto Improving Agents')
        );
    });

    await t.test('collapses extra whitespace', function () {
        assert.equal(normalizeTopic('  inglés  '), normalizeTopic('inglés'));
        assert.equal(normalizeTopic('a   b'), normalizeTopic('a b'));
    });

    await t.test('preserves other special characters', function () {
        assert.equal(normalizeTopic('C++ Avanzado'), 'c++ avanzado');
        assert.equal(normalizeTopic('React (hooks)'), 'react (hooks)');
    });

    await t.test('handles empty/null input', function () {
        assert.equal(normalizeTopic(''), '');
        assert.equal(normalizeTopic(null), '');
        assert.equal(normalizeTopic(undefined), '');
    });
});

// --- toTitleCase ---

test('toTitleCase - title casing', async function (t) {
    await t.test('simple word', function () {
        assert.equal(toTitleCase('inglés'), 'Inglés');
    });

    await t.test('multiple words', function () {
        assert.equal(toTitleCase('standford auto improving agents'), 'Standford Auto Improving Agents');
    });

    await t.test('converts hyphens to spaces and capitalizes', function () {
        assert.equal(toTitleCase('auto-improving agents'), 'Auto Improving Agents');
    });

    await t.test('handles all uppercase', function () {
        assert.equal(toTitleCase('MATEMATICAS'), 'Matematicas');
    });

    await t.test('collapses whitespace', function () {
        assert.equal(toTitleCase('  react   hooks  '), 'React Hooks');
    });

    await t.test('handles empty/null', function () {
        assert.equal(toTitleCase(''), '');
        assert.equal(toTitleCase(null), '');
    });
});

// --- formatDuration ---

test('formatDuration - time formatting', async function (t) {
    await t.test('less than 60 minutes', function () {
        assert.equal(formatDuration(45), '45 min');
        assert.equal(formatDuration(1), '1 min');
        assert.equal(formatDuration(59), '59 min');
    });

    await t.test('exactly 60 minutes', function () {
        assert.equal(formatDuration(60), '1h');
    });

    await t.test('more than 60 minutes', function () {
        assert.equal(formatDuration(90), '1h 30min');
        assert.equal(formatDuration(150), '2h 30min');
    });

    await t.test('exact hours', function () {
        assert.equal(formatDuration(120), '2h');
        assert.equal(formatDuration(180), '3h');
    });

    await t.test('zero and invalid', function () {
        assert.equal(formatDuration(0), '0 min');
        assert.equal(formatDuration(-5), '0 min');
        assert.equal(formatDuration(NaN), '0 min');
    });
});

// --- getWeekRangeForOffset ---

test('getWeekRangeForOffset - week range calculation', async function (t) {
    // Wednesday 22 Oct 2026
    var today = new Date(2026, 9, 22, 15, 0, 0);

    await t.test('offset 0 returns current week Mon–Sun', function () {
        var range = getWeekRangeForOffset(today, 0);
        assert.equal(range.startStr, '2026-10-19'); // Monday
        assert.equal(range.endStr, '2026-10-25');   // Sunday
    });

    await t.test('offset -1 returns previous week', function () {
        var range = getWeekRangeForOffset(today, -1);
        assert.equal(range.startStr, '2026-10-12');
        assert.equal(range.endStr, '2026-10-18');
    });

    await t.test('offset +1 returns next week', function () {
        var range = getWeekRangeForOffset(today, 1);
        assert.equal(range.startStr, '2026-10-26');
        assert.equal(range.endStr, '2026-11-01');
    });

    await t.test('label contains date range', function () {
        var range = getWeekRangeForOffset(today, 0);
        assert.ok(range.label.includes('19'));
        assert.ok(range.label.includes('25'));
    });

    await t.test('works when today is Sunday', function () {
        var sunday = new Date(2026, 9, 25, 10, 0, 0);
        var range = getWeekRangeForOffset(sunday, 0);
        assert.equal(range.startStr, '2026-10-19');
        assert.equal(range.endStr, '2026-10-25');
    });

    await t.test('works when today is Monday', function () {
        var monday = new Date(2026, 9, 19, 10, 0, 0);
        var range = getWeekRangeForOffset(monday, 0);
        assert.equal(range.startStr, '2026-10-19');
        assert.equal(range.endStr, '2026-10-25');
    });
});

// --- getMonthRangeForOffset ---

test('getMonthRangeForOffset - month range calculation', async function (t) {
    var today = new Date(2026, 9, 22, 15, 0, 0); // Oct 22

    await t.test('offset 0 returns current month', function () {
        var range = getMonthRangeForOffset(today, 0);
        assert.equal(range.startStr, '2026-10-01');
        assert.equal(range.endStr, '2026-10-31');
        assert.equal(range.label, 'Octubre 2026');
    });

    await t.test('offset -1 returns previous month', function () {
        var range = getMonthRangeForOffset(today, -1);
        assert.equal(range.startStr, '2026-09-01');
        assert.equal(range.endStr, '2026-09-30');
        assert.equal(range.label, 'Septiembre 2026');
    });

    await t.test('offset +1 returns next month', function () {
        var range = getMonthRangeForOffset(today, 1);
        assert.equal(range.startStr, '2026-11-01');
        assert.equal(range.endStr, '2026-11-30');
        assert.equal(range.label, 'Noviembre 2026');
    });

    await t.test('handles February (non-leap year 2025)', function () {
        var feb = new Date(2025, 1, 15, 12, 0, 0);
        var range = getMonthRangeForOffset(feb, 0);
        assert.equal(range.startStr, '2025-02-01');
        assert.equal(range.endStr, '2025-02-28');
    });

    await t.test('handles year boundary (Jan offset -1 = Dec prev year)', function () {
        var jan = new Date(2026, 0, 15, 12, 0, 0);
        var range = getMonthRangeForOffset(jan, -1);
        assert.equal(range.startStr, '2025-12-01');
        assert.equal(range.endStr, '2025-12-31');
        assert.equal(range.label, 'Diciembre 2025');
    });
});

// --- buildTopicRanking ---

test('buildTopicRanking - topic grouping and ranking', async function (t) {
    await t.test('groups normalized topics and sorts by minutes', function () {
        var sessions = [
            { date: '2026-10-20', topic: 'Inglés', minutes: 60 },
            { date: '2026-10-21', topic: 'ingles', minutes: 30 },
            { date: '2026-10-20', topic: 'Matemáticas', minutes: 45 },
            { date: '2026-10-22', topic: 'MATEMATICAS', minutes: 15 }
        ];
        var result = buildTopicRanking(sessions, '2026-10-19', '2026-10-25');

        assert.equal(result.topics.length, 2);
        assert.equal(result.totalMinutes, 150);

        // Inglés: 90 min (first), Matemáticas: 60 min (second)
        assert.equal(result.topics[0].displayName, 'Inglés');
        assert.equal(result.topics[0].totalMinutes, 90);
        assert.equal(result.topics[1].displayName, 'Matemáticas');
        assert.equal(result.topics[1].totalMinutes, 60);
    });

    await t.test('filters by date range', function () {
        var sessions = [
            { date: '2026-10-18', topic: 'Inglés', minutes: 60 },   // outside
            { date: '2026-10-19', topic: 'Inglés', minutes: 30 },   // inside
            { date: '2026-10-25', topic: 'Inglés', minutes: 20 },   // inside (boundary)
            { date: '2026-10-26', topic: 'Inglés', minutes: 10 }    // outside
        ];
        var result = buildTopicRanking(sessions, '2026-10-19', '2026-10-25');

        assert.equal(result.totalMinutes, 50);
        assert.equal(result.topics[0].totalMinutes, 50);
    });

    await t.test('returns empty for no sessions', function () {
        var result = buildTopicRanking([], '2026-10-19', '2026-10-25');
        assert.equal(result.topics.length, 0);
        assert.equal(result.totalMinutes, 0);
    });

    await t.test('returns empty for null sessions', function () {
        var result = buildTopicRanking(null, '2026-10-19', '2026-10-25');
        assert.equal(result.topics.length, 0);
        assert.equal(result.totalMinutes, 0);
    });

    await t.test('calculates percentages correctly', function () {
        var sessions = [
            { date: '2026-10-20', topic: 'A', minutes: 75 },
            { date: '2026-10-20', topic: 'B', minutes: 25 }
        ];
        var result = buildTopicRanking(sessions, '2026-10-19', '2026-10-25');

        assert.equal(result.topics[0].percentage, 75);
        assert.equal(result.topics[1].percentage, 25);
    });

    await t.test('handles hyphen normalization in grouping', function () {
        var sessions = [
            { date: '2026-10-20', topic: 'Standford Auto-Improving Agents', minutes: 40 },
            { date: '2026-10-21', topic: 'Standford Auto Improving Agents', minutes: 20 }
        ];
        var result = buildTopicRanking(sessions, '2026-10-19', '2026-10-25');

        assert.equal(result.topics.length, 1);
        assert.equal(result.topics[0].totalMinutes, 60);
    });

    await t.test('skips sessions with empty topic', function () {
        var sessions = [
            { date: '2026-10-20', topic: '', minutes: 30 },
            { date: '2026-10-20', topic: 'Inglés', minutes: 45 }
        ];
        var result = buildTopicRanking(sessions, '2026-10-19', '2026-10-25');

        assert.equal(result.topics.length, 1);
        assert.equal(result.totalMinutes, 45);
    });

    await t.test('skips sessions with invalid minutes', function () {
        var sessions = [
            { date: '2026-10-20', topic: 'Inglés', minutes: 0 },
            { date: '2026-10-20', topic: 'Inglés', minutes: -5 },
            { date: '2026-10-20', topic: 'Inglés', minutes: 30 }
        ];
        var result = buildTopicRanking(sessions, '2026-10-19', '2026-10-25');

        assert.equal(result.totalMinutes, 30);
    });
});
