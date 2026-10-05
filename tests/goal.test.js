const test = require('node:test');
const assert = require('node:assert/strict');
const { getWeekRange, validateGoalInput, calculateWeeklyProgress } = require('../goal.js');

test('goal module - Tarea 1: Rango semanal y validación de entrada', async (t) => {
    await t.test('getWeekRange calculates Monday to Sunday correctly for a Wednesday', () => {
        // Miércoles 6 de mayo de 2026
        const today = new Date(2026, 4, 6, 15, 30, 0);
        const range = getWeekRange(today);
        
        assert.equal(range.startStr, '2026-05-04', 'El lunes debe ser 2026-05-04');
        assert.equal(range.endStr, '2026-05-10', 'El domingo debe ser 2026-05-10');
    });

    await t.test('getWeekRange calculates Monday to Sunday correctly when today is Monday', () => {
        // Lunes 4 de mayo de 2026
        const today = new Date(2026, 4, 4, 10, 0, 0);
        const range = getWeekRange(today);
        
        assert.equal(range.startStr, '2026-05-04', 'El inicio debe ser el propio lunes');
        assert.equal(range.endStr, '2026-05-10', 'El fin debe ser el domingo de esa semana');
    });

    await t.test('getWeekRange calculates Monday to Sunday correctly when today is Sunday', () => {
        // Domingo 10 de mayo de 2026
        const today = new Date(2026, 4, 10, 22, 0, 0);
        const range = getWeekRange(today);
        
        assert.equal(range.startStr, '2026-05-04', 'El inicio debe ser el lunes anterior');
        assert.equal(range.endStr, '2026-05-10', 'El fin debe ser el propio domingo');
    });

    await t.test('getWeekRange handles month and year boundary correctly', () => {
        // Jueves 1 de enero de 2026
        const today = new Date(2026, 0, 1, 12, 0, 0);
        const range = getWeekRange(today);
        
        assert.equal(range.startStr, '2025-12-29', 'El lunes debe ser 2025-12-29');
        assert.equal(range.endStr, '2026-01-04', 'El domingo debe ser 2026-01-04');
    });

    await t.test('validateGoalInput accepts valid positive integers', () => {
        const res300 = validateGoalInput(300);
        assert.equal(res300.valid, true);
        assert.equal(res300.minutes, 300);
        assert.equal(res300.error, null);

        const resStr = validateGoalInput('120');
        assert.equal(resStr.valid, true);
        assert.equal(resStr.minutes, 120);

        const resMax = validateGoalInput(10080);
        assert.equal(resMax.valid, true);
        assert.equal(resMax.minutes, 10080);
    });

    await t.test('validateGoalInput rejects invalid, negative, zero or out-of-range values', () => {
        assert.equal(validateGoalInput(0).valid, false);
        assert.equal(validateGoalInput(-15).valid, false);
        assert.equal(validateGoalInput(10081).valid, false);
        assert.equal(validateGoalInput('abc').valid, false);
        assert.equal(validateGoalInput('   ').valid, false);
        assert.equal(validateGoalInput(null).valid, false);
        assert.equal(validateGoalInput(undefined).valid, false);
        assert.equal(validateGoalInput(45.5).valid, false);
    });
});

test('goal module - Tarea 2: Cálculo de progreso semanal', async (t) => {
    // Semana del lunes 2026-05-04 al domingo 2026-05-10
    const wednesday = new Date(2026, 4, 6, 18, 0, 0);

    await t.test('returns 0 minutes and 0% for empty sessions', () => {
        const res = calculateWeeklyProgress([], 300, wednesday);
        assert.equal(res.currentMinutes, 0);
        assert.equal(res.goalMinutes, 300);
        assert.equal(res.percentage, 0);
        assert.equal(res.isCompleted, false);
        assert.equal(res.remainingMinutes, 300);
        assert.equal(res.extraMinutes, 0);
        assert.equal(res.weekRange.startStr, '2026-05-04');
        assert.equal(res.weekRange.endStr, '2026-05-10');
    });

    await t.test('aggregates sessions within current week correctly', () => {
        const sessions = [
            { date: '2026-05-04', minutes: 60 },
            { date: '2026-05-05', minutes: 45 },
            { date: '2026-05-05', minutes: 15 }, // Múltiples el mismo día
            { date: '2026-05-06', minutes: 30 }
        ];
        const res = calculateWeeklyProgress(sessions, 300, wednesday);
        assert.equal(res.currentMinutes, 150); // 60 + 45 + 15 + 30
        assert.equal(res.percentage, 50); // 150 / 300 = 50%
        assert.equal(res.isCompleted, false);
        assert.equal(res.remainingMinutes, 150);
        assert.equal(res.extraMinutes, 0);
    });

    await t.test('ignores sessions outside the current week and future dates', () => {
        const sessions = [
            { date: '2026-05-03', minutes: 120 }, // Semana anterior (domingo)
            { date: '2026-05-04', minutes: 50 },  // Válido
            { date: '2026-05-07', minutes: 80 },  // Futuro (jueves, hoy es miércoles)
            { date: '2026-05-11', minutes: 60 }   // Semana siguiente
        ];
        const res = calculateWeeklyProgress(sessions, 200, wednesday);
        assert.equal(res.currentMinutes, 50);
        assert.equal(res.percentage, 25);
    });

    await t.test('handles invalid, negative and corrupted minutes defensively', () => {
        const sessions = [
            { date: '2026-05-04', minutes: -30 },
            { date: '2026-05-04', minutes: 'invalid' },
            { date: '2026-05-04', minutes: null },
            { date: '2026-05-05', minutes: '40' },
            { date: '2026-05-06', minutes: 20 }
        ];
        const res = calculateWeeklyProgress(sessions, 100, wednesday);
        assert.equal(res.currentMinutes, 60); // 40 + 20
        assert.equal(res.percentage, 60);
    });

    await t.test('calculates 100% and goal completion correctly', () => {
        const sessions = [
            { date: '2026-05-04', minutes: 150 },
            { date: '2026-05-05', minutes: 150 }
        ];
        const res = calculateWeeklyProgress(sessions, 300, wednesday);
        assert.equal(res.currentMinutes, 300);
        assert.equal(res.percentage, 100);
        assert.equal(res.isCompleted, true);
        assert.equal(res.remainingMinutes, 0);
        assert.equal(res.extraMinutes, 0);
    });

    await t.test('handles exceeding goal (> 100%) correctly', () => {
        const sessions = [
            { date: '2026-05-04', minutes: 200 },
            { date: '2026-05-05', minutes: 200 }
        ];
        const res = calculateWeeklyProgress(sessions, 300, wednesday);
        assert.equal(res.currentMinutes, 400);
        assert.equal(res.percentage, 133); // Math.round((400 / 300) * 100)
        assert.equal(res.isCompleted, true);
        assert.equal(res.remainingMinutes, 0);
        assert.equal(res.extraMinutes, 100);
    });

    await t.test('uses default 300 minutes fallback if goal is invalid or <= 0', () => {
        const sessions = [{ date: '2026-05-04', minutes: 150 }];
        const resZero = calculateWeeklyProgress(sessions, 0, wednesday);
        assert.equal(resZero.goalMinutes, 300);
        assert.equal(resZero.percentage, 50);

        const resNull = calculateWeeklyProgress(sessions, null, wednesday);
        assert.equal(resNull.goalMinutes, 300);
    });
});
