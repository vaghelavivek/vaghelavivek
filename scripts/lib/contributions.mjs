const DAY_MS = 24 * 60 * 60 * 1000;

const toTime = (date) => Date.parse(`${date}T00:00:00Z`);

/** Merge calendars from several years into one sorted list of unique days. */
export function mergeDays(dayLists) {
  const byDate = new Map();
  for (const day of dayLists.flat()) {
    const existing = byDate.get(day.date);
    if (!existing || day.count > existing.count) byDate.set(day.date, day);
  }
  return [...byDate.values()].sort((a, b) => toTime(a.date) - toTime(b.date));
}

function bestMonth(days) {
  const totals = new Map();
  for (const { date, count } of days) {
    const month = date.slice(0, 7);
    totals.set(month, (totals.get(month) ?? 0) + count);
  }
  let best = { month: days[0]?.date.slice(0, 7) ?? '', count: 0 };
  for (const [month, count] of totals) {
    if (count > best.count) best = { month, count };
  }
  return best;
}

function bestDay(days) {
  return days.reduce((best, d) => (d.count > best.count ? { date: d.date, count: d.count } : best), {
    date: days[0]?.date ?? '',
    count: 0,
  });
}

export function computeStats(days, today) {
  const year = today.slice(0, 4);
  const yearAgo = toTime(today) - 365 * DAY_MS;
  const sum = (list) => list.reduce((total, d) => total + d.count, 0);
  return {
    total: sum(days),
    year,
    thisYear: sum(days.filter((d) => d.date.startsWith(year))),
    lastYear: sum(days.filter((d) => toTime(d.date) > yearAgo && d.date <= today)),
    bestMonth: bestMonth(days),
    bestDay: bestDay(days),
  };
}
