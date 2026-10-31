import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats, mergeDays } from './streaks.mjs';

const days = (start, counts) =>
  counts.map((count, i) => {
    const date = new Date(Date.parse(`${start}T00:00:00Z`) + i * 86400000);
    return { date: date.toISOString().slice(0, 10), count };
  });

test('current streak counts back from today', () => {
  const stats = computeStats(days('2026-10-27', [0, 2, 1, 3, 4]), '2026-10-31');
  assert.equal(stats.currentStreak, 4);
});

test('no commits yet today does not break the streak', () => {
  const stats = computeStats(days('2026-10-28', [1, 1, 1, 0]), '2026-10-31');
  assert.equal(stats.currentStreak, 3);
});

test('a missed day before yesterday ends the streak', () => {
  const stats = computeStats(days('2026-10-27', [5, 0, 0, 1, 0]), '2026-10-31');
  assert.equal(stats.currentStreak, 1);
});

test('longest streak spans year boundaries', () => {
  const merged = mergeDays([days('2025-12-30', [1, 1]), days('2026-01-01', [1, 1, 0])]);
  assert.equal(computeStats(merged, '2026-01-03').longestStreak, 4);
});

test('gaps in the date list break the longest streak', () => {
  const merged = mergeDays([days('2026-01-01', [1, 1]), days('2026-01-05', [1])]);
  assert.equal(computeStats(merged, '2026-01-05').longestStreak, 2);
});

test('totals: all time, this year and last 365 days', () => {
  const merged = mergeDays([days('2025-12-31', [10]), days('2026-01-01', [3, 4])]);
  const stats = computeStats(merged, '2026-01-02');
  assert.deepEqual(
    { total: stats.total, thisYear: stats.thisYear, lastYear: stats.lastYear },
    { total: 17, thisYear: 7, lastYear: 17 },
  );
});

test('mergeDays keeps the higher count for duplicate dates', () => {
  const merged = mergeDays([[{ date: '2026-01-01', count: 1 }], [{ date: '2026-01-01', count: 3 }]]);
  assert.deepEqual(merged, [{ date: '2026-01-01', count: 3 }]);
});
