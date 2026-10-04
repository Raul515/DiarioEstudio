const test = require('node:test');
const assert = require('node:assert');
const {
    calculateLevel,
    getStartDate,
    formatDate,
    parseLocalDate,
    addDays,
    formatDisplayDate,
    generateHeatmapData
} = require('../heatmap.js');

test('heatmap module - Tarea 1.2: Funciones auxiliares', async (t) => {
    await t.test('calculateLevel assigns correct intensity levels', () => {
        // Level 0: 0 minutes or invalid
        assert.strictEqual(calculateLevel(0), 0);
        assert.strictEqual(calculateLevel(-15), 0);
        assert.strictEqual(calculateLevel(null), 0);
        assert.strictEqual(calculateLevel(NaN), 0);

        // Level 1: 1 - 29 min
        assert.strictEqual(calculateLevel(1), 1);
        assert.strictEqual(calculateLevel(15), 1);
        assert.strictEqual(calculateLevel(29), 1);

        // Level 2: 30 - 59 min
        assert.strictEqual(calculateLevel(30), 2);
        assert.strictEqual(calculateLevel(45), 2);
        assert.strictEqual(calculateLevel(59), 2);

        // Level 3: 60 - 119 min
        assert.strictEqual(calculateLevel(60), 3);
        assert.strictEqual(calculateLevel(90), 3);
        assert.strictEqual(calculateLevel(119), 3);

        // Level 4: 120+ min
        assert.strictEqual(calculateLevel(120), 4);
        assert.strictEqual(calculateLevel(240), 4);
    });

    await t.test('getStartDate returns Monday 11 weeks ago', () => {
        // Wednesday 2026-10-07
        const wednesday = parseLocalDate('2026-10-07');
        const startFromWed = getStartDate(wednesday);
        // Monday of current week is 2026-10-05. 11 weeks ago = 77 days ago = 2026-07-20.
        assert.strictEqual(formatDate(startFromWed), '2026-07-20');
        assert.strictEqual(startFromWed.getDay(), 1, 'Start date must be Monday');

        // Sunday 2026-10-11
        const sunday = parseLocalDate('2026-10-11');
        const startFromSun = getStartDate(sunday);
        assert.strictEqual(formatDate(startFromSun), '2026-07-20');
        assert.strictEqual(startFromSun.getDay(), 1, 'Start date must be Monday');

        // Monday 2026-10-05
        const monday = parseLocalDate('2026-10-05');
        const startFromMon = getStartDate(monday);
        assert.strictEqual(formatDate(startFromMon), '2026-07-20');
        assert.strictEqual(startFromMon.getDay(), 1, 'Start date must be Monday');
    });

    await t.test('formatDisplayDate formats in Spanish correctly', () => {
        const date = parseLocalDate('2026-05-04'); // Monday, May 4, 2026
        const formatted = formatDisplayDate(date);
        assert.strictEqual(formatted, 'Lunes, 4 de mayo de 2026');
    });
});

test('heatmap module - Tarea 1.3: Dimensiones y Días futuros', async (t) => {
    await t.test('generates exactly 84 cells (12 weeks * 7 days)', () => {
        const today = parseLocalDate('2026-10-07');
        const grid = generateHeatmapData([], today);
        assert.strictEqual(grid.length, 84);
    });

    await t.test('marks future days correctly when today is Monday', () => {
        const todayMonday = parseLocalDate('2026-10-05'); // Monday
        const grid = generateHeatmapData([], todayMonday);
        assert.strictEqual(grid.length, 84);

        // First 77 cells are past weeks (all isFuture: false)
        for (let i = 0; i < 77; i++) {
            assert.strictEqual(grid[i].isFuture, false, `Cell ${i} should not be future`);
        }
        // Cell 77 is today (Monday): isFuture: false
        assert.strictEqual(grid[77].isFuture, false, 'Today (Monday) should not be future');
        assert.strictEqual(grid[77].dateStr, '2026-10-05');

        // Cells 78 to 83 are Tuesday to Sunday of current week: isFuture: true
        for (let i = 78; i < 84; i++) {
            assert.strictEqual(grid[i].isFuture, true, `Cell ${i} should be future`);
        }
    });

    await t.test('marks 0 future days when today is Sunday', () => {
        const todaySunday = parseLocalDate('2026-10-11'); // Sunday
        const grid = generateHeatmapData([], todaySunday);
        assert.strictEqual(grid.length, 84);

        const futureDays = grid.filter(cell => cell.isFuture);
        assert.strictEqual(futureDays.length, 0, 'No cells should be future on Sunday');
        assert.strictEqual(grid[83].dateStr, '2026-10-11');
        assert.strictEqual(grid[83].isFuture, false);
    });
});

test('heatmap module - Tarea 1.4: Agregación de sesiones y casos límite', async (t) => {
    const today = parseLocalDate('2026-10-07'); // Wednesday

    await t.test('aggregates multiple sessions on the same date', () => {
        const sessions = [
            { date: '2026-10-07', minutes: 20 },
            { date: '2026-10-07', minutes: 20 },
            { date: '2026-10-07', minutes: 30 }
        ];
        const grid = generateHeatmapData(sessions, today);
        const todayCell = grid.find(c => c.dateStr === '2026-10-07');
        assert.ok(todayCell, 'Today cell should exist');
        assert.strictEqual(todayCell.minutes, 70);
        assert.strictEqual(todayCell.level, 3); // 60-119 min is level 3
    });

    await t.test('ignores future sessions and sessions older than 12 weeks', () => {
        const sessions = [
            { date: '2026-10-08', minutes: 120 }, // Tomorrow (future)
            { date: '2025-01-01', minutes: 120 }, // More than 12 weeks ago
            { date: '2026-10-07', minutes: 45 }   // Today
        ];
        const grid = generateHeatmapData(sessions, today);
        const tomorrowCell = grid.find(c => c.dateStr === '2026-10-08');
        assert.strictEqual(tomorrowCell.minutes, 0);
        assert.strictEqual(tomorrowCell.level, 0);

        const todayCell = grid.find(c => c.dateStr === '2026-10-07');
        assert.strictEqual(todayCell.minutes, 45);
        assert.strictEqual(todayCell.level, 2);
    });

    await t.test('handles invalid minutes defensively (negative, NaN, null)', () => {
        const sessions = [
            { date: '2026-10-07', minutes: -50 },
            { date: '2026-10-07', minutes: 'invalid' },
            { date: '2026-10-07', minutes: null },
            { date: '2026-10-07', minutes: 25 }
        ];
        const grid = generateHeatmapData(sessions, today);
        const todayCell = grid.find(c => c.dateStr === '2026-10-07');
        assert.strictEqual(todayCell.minutes, 25);
        assert.strictEqual(todayCell.level, 1);
    });

    await t.test('empty sessions produces all level 0 cells', () => {
        const grid = generateHeatmapData([], today);
        for (const cell of grid) {
            assert.strictEqual(cell.minutes, 0);
            assert.strictEqual(cell.level, 0);
        }
    });
});
