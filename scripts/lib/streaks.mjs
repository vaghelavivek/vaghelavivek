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

function longestStreak(days) {
  let best = 0;
  let run = 0;
  let previous = null;
  for (const { date, count } of days) {
    const contiguous = previous !== null && toTime(date) - previous === DAY_MS;
    run = count > 0 ? (contiguous ? run + 1 : 1) : 0;
    best = Math.max(best, run);
    previous = toTime(date);
  }
  return best;
}

/** Streak ending today, or yesterday if nothing has been pushed yet today. */
function currentStreak(days, today) {
  const counts = new Map(days.map((d) => [d.date, d.count]));
  let cursor = toTime(today);
  if (!counts.get(today)) cursor -= DAY_MS;
  let streak = 0;
  while ((counts.get(new Date(cursor).toISOString().slice(0, 10)) ?? 0) > 0) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
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
    currentStreak: currentStreak(days, today),
    longestStreak: longestStreak(days),
  };
}
