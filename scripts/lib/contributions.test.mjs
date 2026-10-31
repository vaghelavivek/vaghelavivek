import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats, mergeDays } from './contributions.mjs';

const days = (start, counts) =>
  counts.map((count, i) => {
    const date = new Date(Date.parse(`${start}T00:00:00Z`) + i * 86400000);
    return { date: date.toISOString().slice(0, 10), count };
  });

test('totals: all time, this year and last 365 days', () => {
  const merged = mergeDays([days('2025-12-31', [10]), days('2026-01-01', [3, 4])]);
  const stats = computeStats(merged, '2026-01-02');
  assert.deepEqual(
    { total: stats.total, thisYear: stats.thisYear, lastYear: stats.lastYear },
    { total: 17, thisYear: 7, lastYear: 17 },
  );
});

test('best month sums days within each calendar month', () => {
  const merged = mergeDays([days('2026-01-30', [5, 5]), days('2026-02-01', [4, 4, 4])]);
  assert.deepEqual(computeStats(merged, '2026-02-03').bestMonth, { month: '2026-02', count: 12 });
});

test('best day picks the highest single day', () => {
  const stats = computeStats(days('2026-03-01', [2, 9, 4]), '2026-03-03');
  assert.deepEqual(stats.bestDay, { date: '2026-03-02', count: 9 });
});

test('empty history gives zeros instead of crashing', () => {
  const stats = computeStats([], '2026-03-03');
  assert.equal(stats.total, 0);
  assert.equal(stats.bestMonth.count, 0);
  assert.equal(stats.bestDay.count, 0);
});

test('mergeDays keeps the higher count for duplicate dates', () => {
  const merged = mergeDays([[{ date: '2026-01-01', count: 1 }], [{ date: '2026-01-01', count: 3 }]]);
  assert.deepEqual(merged, [{ date: '2026-01-01', count: 3 }]);
});
