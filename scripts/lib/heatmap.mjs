import { MONTHS, THEME, formatNumber } from './theme.mjs';

const LEVEL_COLORS = {
  NONE: THEME.panel,
  FIRST_QUARTILE: '#2b4a7a',
  SECOND_QUARTILE: '#3d6bb3',
  THIRD_QUARTILE: '#5a8de0',
  FOURTH_QUARTILE: '#7aa2f7',
};

function monthLabels(weeks, cell, left, y) {
  let lastMonth = -1;
  let lastX = -Infinity;
  return weeks
    .map((week, i) => {
      const month = new Date(`${week[0].date}T00:00:00Z`).getUTCMonth();
      const x = left + i * cell;
      if (month === lastMonth) return '';
      lastMonth = month;
      // Skip a label that would collide with the previous one (partial first month).
      if (x - lastX < cell * 3 || i > weeks.length - 3) return '';
      lastX = x;
      return `<text x="${x}" y="${y}" class="month">${MONTHS[month]}</text>`;
    })
    .join('');
}

export function renderHeatmap(days, total) {
  const cell = 15;
  const size = 11;
  const left = 40;
  const top = 66;
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const width = Math.max(840, left + weeks.length * cell + 24);
  const height = top + 7 * cell + 38;

  const columns = weeks
    .map((week, w) =>
      week
        .map((day) => {
          const row = new Date(`${day.date}T00:00:00Z`).getUTCDay();
          const color = LEVEL_COLORS[day.level] ?? THEME.panel;
          return `<rect x="${left + w * cell}" y="${top + row * cell}" width="${size}" height="${size}" rx="2.5" fill="${color}"><title>${day.count} on ${day.date}</title></rect>`;
        })
        .join(''),
    )
    .join('\n  ');

  const legendX = width - 24 - 34 - 5 * cell;
  const legend = Object.values(LEVEL_COLORS)
    .map((color, i) => `<rect x="${legendX + i * cell}" y="${height - 24}" width="${size}" height="${size}" rx="2.5" fill="${color}"/>`)
    .join('');
  const label = `${formatNumber(total)} contributions in the last year`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
  <title>${label}</title>
  <defs>
    <radialGradient id="glow" cx="0.1" cy="0" r="0.9"><stop offset="0" stop-color="${THEME.accent}" stop-opacity="0.16"/><stop offset="1" stop-color="${THEME.accent}" stop-opacity="0"/></radialGradient>
  </defs>
  <style>
    .title { font: 700 13px ${THEME.font}; fill: ${THEME.text}; letter-spacing: 2px; }
    .count { font: 600 13px ${THEME.font}; fill: ${THEME.accent}; }
    .month, .day, .legend { font: 400 11px ${THEME.font}; fill: ${THEME.muted}; }
  </style>
  <rect width="${width}" height="${height}" rx="14" fill="${THEME.bg}"/>
  <rect width="${width}" height="${height}" rx="14" fill="url(#glow)"/>
  <text x="20" y="32" class="title">LAST 12 MONTHS</text>
  <text x="${width - 20}" y="32" class="count" text-anchor="end">${label}</text>
  ${monthLabels(weeks, cell, left, top - 10)}
  <text x="8" y="${top + 1 * cell + 9}" class="day">Mon</text>
  <text x="8" y="${top + 3 * cell + 9}" class="day">Wed</text>
  <text x="8" y="${top + 5 * cell + 9}" class="day">Fri</text>
  ${columns}
  <text x="${legendX - 6}" y="${height - 14}" class="legend" text-anchor="end">Less</text>${legend}<text x="${legendX + 5 * cell + 2}" y="${height - 14}" class="legend">More</text>
</svg>
`;
}
