const THEME = {
  bg: '#1a1b27',
  panel: '#24283b',
  accent: '#7aa2f7',
  accent2: '#bb9af7',
  text: '#c0caf5',
  muted: '#787c99',
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
};

const LEVEL_COLORS = {
  NONE: THEME.panel,
  FIRST_QUARTILE: '#2b4a7a',
  SECOND_QUARTILE: '#3d6bb3',
  THIRD_QUARTILE: '#5a8de0',
  FOURTH_QUARTILE: '#7aa2f7',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

const formatNumber = (n) => n.toLocaleString('en-US');

const formatUpdated = (date) =>
  `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')} UTC`;

export function renderStatsCard(stats, updatedAt) {
  const width = 840;
  const height = 190;
  const items = [
    { value: formatNumber(stats.total), label: 'Total contributions', sub: 'since joining GitHub' },
    { value: formatNumber(stats.thisYear), label: `Contributions in ${stats.year}`, sub: `${formatNumber(stats.lastYear)} in last 365 days` },
    { value: `${stats.currentStreak} days`, label: 'Current streak', sub: 'consecutive days' },
    { value: `${stats.longestStreak} days`, label: 'Longest streak', sub: 'all time' },
  ];
  const column = width / items.length;
  const cells = items
    .map((item, i) => {
      const x = column * i + column / 2;
      const divider = i > 0 ? `<line x1="${column * i}" y1="40" x2="${column * i}" y2="130" stroke="${THEME.panel}" stroke-width="2"/>` : '';
      return `${divider}<g>
    <text x="${x}" y="82" class="value">${escapeXml(item.value)}</text>
    <text x="${x}" y="110" class="label">${escapeXml(item.label)}</text>
    <text x="${x}" y="130" class="sub">${escapeXml(item.sub)}</text>
  </g>`;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="GitHub contribution stats">
  <title>GitHub contribution stats</title>
  <style>
    .value { font: 700 30px ${THEME.font}; fill: ${THEME.accent}; text-anchor: middle; }
    .label { font: 600 14px ${THEME.font}; fill: ${THEME.text}; text-anchor: middle; }
    .sub { font: 400 12px ${THEME.font}; fill: ${THEME.muted}; text-anchor: middle; }
    .foot { font: 400 11px ${THEME.font}; fill: ${THEME.muted}; text-anchor: middle; }
  </style>
  <rect width="${width}" height="${height}" rx="12" fill="${THEME.bg}"/>
  <rect x="0" y="0" width="${width}" height="4" rx="2" fill="url(#bar)"/>
  <defs><linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="${THEME.accent}"/><stop offset="1" stop-color="${THEME.accent2}"/></linearGradient></defs>
  ${cells}
  <text x="${width / 2}" y="172" class="foot">Includes private client repositories · updated ${escapeXml(formatUpdated(updatedAt))}</text>
</svg>
`;
}

const formatMonth = (yyyyMm) => {
  const [year, month] = yyyyMm.split('-').map(Number);
  return `${MONTHS[month - 1]} ${year}`;
};

/** Grid of highlight tiles, 4 per row. */
export function renderHighlights(highlights, manualFiguresAsOf) {
  const width = 840;
  const perRow = 4;
  const rowHeight = 92;
  const rows = Math.ceil(highlights.length / perRow);
  const height = 28 + rows * rowHeight + 30;
  const column = width / perRow;

  const tiles = highlights
    .map((item, i) => {
      const x = column * (i % perRow) + column / 2;
      const y = 28 + Math.floor(i / perRow) * rowHeight;
      return `<text x="${x}" y="${y + 38}" class="value">${escapeXml(item.value)}</text>
  <text x="${x}" y="${y + 64}" class="label">${escapeXml(item.label)}</text>`;
    })
    .join('\n  ');

  const dividers = Array.from({ length: perRow - 1 }, (_, i) => column * (i + 1))
    .map((x) => `<line x1="${x}" y1="30" x2="${x}" y2="${height - 40}" stroke="${THEME.panel}" stroke-width="2"/>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Career highlights">
  <title>Career highlights</title>
  <style>
    .value { font: 700 30px ${THEME.font}; fill: ${THEME.accent}; text-anchor: middle; }
    .label { font: 500 13px ${THEME.font}; fill: ${THEME.text}; text-anchor: middle; }
    .foot { font: 400 11px ${THEME.font}; fill: ${THEME.muted}; text-anchor: middle; }
  </style>
  <rect width="${width}" height="${height}" rx="12" fill="${THEME.bg}"/>
  <rect x="0" y="0" width="${width}" height="4" rx="2" fill="url(#bar)"/>
  <defs><linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="${THEME.accent}"/><stop offset="1" stop-color="${THEME.accent2}"/></linearGradient></defs>
  ${dividers}
  ${tiles}
  <text x="${width / 2}" y="${height - 14}" class="foot">Year counts update automatically · Upwork and client-project figures as of ${escapeXml(formatMonth(manualFiguresAsOf))}</text>
</svg>
`;
}

function monthLabels(weeks, cell, left) {
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
      return `<text x="${x}" y="44" class="month">${MONTHS[month]}</text>`;
    })
    .join('');
}

export function renderHeatmap(days, total) {
  const cell = 15;
  const size = 11;
  const left = 36;
  const top = 54;
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const width = left + weeks.length * cell + 20;
  const height = top + 7 * cell + 34;

  const columns = weeks
    .map((week, w) => {
      const rects = week
        .map((day) => {
          const row = new Date(`${day.date}T00:00:00Z`).getUTCDay();
          const color = LEVEL_COLORS[day.level] ?? THEME.panel;
          return `<rect x="${left + w * cell}" y="${top + row * cell}" width="${size}" height="${size}" rx="2" fill="${color}"><title>${day.count} on ${day.date}</title></rect>`;
        })
        .join('');
      return `<g>${rects}</g>`;
    })
    .join('\n  ');

  const legendX = width - 20 - 34 - 5 * cell;
  const legend = Object.values(LEVEL_COLORS)
    .map((color, i) => `<rect x="${legendX + i * cell}" y="${height - 22}" width="${size}" height="${size}" rx="2" fill="${color}"/>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${formatNumber(total)} contributions in the last year">
  <title>${formatNumber(total)} contributions in the last year</title>
  <style>
    .title { font: 600 15px ${THEME.font}; fill: ${THEME.text}; }
    .month, .day, .legend { font: 400 11px ${THEME.font}; fill: ${THEME.muted}; }
  </style>
  <rect width="${width}" height="${height}" rx="12" fill="${THEME.bg}"/>
  <text x="${left}" y="24" class="title">${formatNumber(total)} contributions in the last year</text>
  ${monthLabels(weeks, cell, left)}
  <text x="4" y="${top + 1 * cell + 9}" class="day">Mon</text>
  <text x="4" y="${top + 3 * cell + 9}" class="day">Wed</text>
  <text x="4" y="${top + 5 * cell + 9}" class="day">Fri</text>
  ${columns}
  <text x="${legendX - 6}" y="${height - 12}" class="legend" text-anchor="end">Less</text>${legend}<text x="${legendX + 5 * cell + 2}" y="${height - 12}" class="legend">More</text>
</svg>
`;
}
