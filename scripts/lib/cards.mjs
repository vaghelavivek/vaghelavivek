import { THEME, escapeXml, formatDay, formatMonth, formatNumber, formatUpdated } from './theme.mjs';

const WIDTH = 840;
const PAD = 16;
const GAP = 12;
const PER_ROW = 4;
const TOP = 52;

function liveDot(x, y) {
  return `<circle cx="${x}" cy="${y}" r="4" fill="${THEME.live}"><animate attributeName="opacity" values="1;0.25;1" dur="2s" repeatCount="indefinite"/></circle>
  <text x="${x + 10}" y="${y + 4}" class="tag" fill="${THEME.live}">LIVE</text>`;
}

function tile(item, x, y, w, h) {
  const cx = x + w / 2;
  const sub = item.sub ? `<text x="${cx}" y="${y + 90}" class="sub">${escapeXml(item.sub)}</text>` : '';
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${THEME.panel}"/>
    <rect x="${cx - 16}" y="${y}" width="32" height="3" rx="1.5" fill="url(#accent)"/>
    <text x="${cx}" y="${y + 50}" class="value">${escapeXml(item.value)}</text>
    <text x="${cx}" y="${y + 72}" class="label">${escapeXml(item.label)}</text>
    ${sub}
  </g>`;
}

/** Card with a title row, a grid of tiles (4 per row) and a footer line. */
export function renderTileCard({ title, ariaLabel, items, footer, live = false }) {
  const tileW = (WIDTH - PAD * 2 - GAP * (PER_ROW - 1)) / PER_ROW;
  const tileH = items.some((i) => i.sub) ? 104 : 88;
  const rows = Math.ceil(items.length / PER_ROW);
  const height = TOP + rows * tileH + (rows - 1) * GAP + 40;

  const tiles = items
    .map((item, i) => tile(item, PAD + (i % PER_ROW) * (tileW + GAP), TOP + Math.floor(i / PER_ROW) * (tileH + GAP), tileW, tileH))
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-label="${escapeXml(ariaLabel)}">
  <title>${escapeXml(ariaLabel)}</title>
  <defs>
    <linearGradient id="accent" x1="0" x2="1"><stop offset="0" stop-color="${THEME.accent}"/><stop offset="1" stop-color="${THEME.accent2}"/></linearGradient>
    <radialGradient id="glow" cx="0.1" cy="0" r="0.9"><stop offset="0" stop-color="${THEME.accent}" stop-opacity="0.16"/><stop offset="1" stop-color="${THEME.accent}" stop-opacity="0"/></radialGradient>
  </defs>
  <style>
    .title { font: 700 13px ${THEME.font}; fill: ${THEME.text}; letter-spacing: 2px; }
    .tag { font: 700 11px ${THEME.font}; letter-spacing: 1.5px; }
    .value { font: 800 32px ${THEME.font}; fill: url(#accent); text-anchor: middle; }
    .label { font: 600 13px ${THEME.font}; fill: ${THEME.text}; text-anchor: middle; }
    .sub { font: 400 11px ${THEME.font}; fill: ${THEME.muted}; text-anchor: middle; }
    .foot { font: 400 11px ${THEME.font}; fill: ${THEME.muted}; text-anchor: middle; }
  </style>
  <rect width="${WIDTH}" height="${height}" rx="14" fill="${THEME.bg}"/>
  <rect width="${WIDTH}" height="${height}" rx="14" fill="url(#glow)"/>
  <text x="${PAD + 4}" y="32" class="title">${escapeXml(title)}</text>
  ${live ? liveDot(WIDTH - PAD - 46, 28) : ''}
  ${tiles}
  <text x="${WIDTH / 2}" y="${height - 14}" class="foot">${escapeXml(footer)}</text>
</svg>
`;
}

export function renderHighlights(highlights, manualFiguresAsOf) {
  return renderTileCard({
    title: 'CAREER HIGHLIGHTS',
    ariaLabel: 'Career highlights',
    items: highlights,
    footer: `Year counts update automatically · other figures as of ${formatMonth(manualFiguresAsOf)}`,
  });
}

export function renderContributions(stats, updatedAt) {
  return renderTileCard({
    title: 'GITHUB CONTRIBUTIONS',
    ariaLabel: 'GitHub contribution stats',
    live: true,
    items: [
      { value: formatNumber(stats.total), label: 'Total contributions', sub: 'incl. private client work' },
      { value: formatNumber(stats.thisYear), label: `Contributions in ${stats.year}`, sub: `${formatNumber(stats.lastYear)} in last 365 days` },
      { value: formatNumber(stats.bestMonth.count), label: 'Best month', sub: formatMonth(stats.bestMonth.month) },
      { value: formatNumber(stats.bestDay.count), label: 'Best single day', sub: formatDay(stats.bestDay.date) },
    ],
    footer: `Live from the GitHub API · updated ${formatUpdated(updatedAt)}`,
  });
}
