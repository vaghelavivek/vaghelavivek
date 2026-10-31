export const THEME = {
  bg: '#1a1b27',
  panel: '#24283b',
  accent: '#7aa2f7',
  accent2: '#bb9af7',
  live: '#9ece6a',
  text: '#c0caf5',
  muted: '#787c99',
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
};

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

export const formatNumber = (n) => n.toLocaleString('en-US');

/** "2026-10" -> "Oct 2026" */
export const formatMonth = (yyyyMm) => {
  const [year, month] = yyyyMm.split('-').map(Number);
  return `${MONTHS[month - 1]} ${year}`;
};

/** "2026-10-12" -> "12 Oct 2026" */
export const formatDay = (yyyyMmDd) => {
  const [year, month, day] = yyyyMmDd.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
};

export const formatUpdated = (date) =>
  `${formatDay(date.toISOString().slice(0, 10))}, ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')} UTC`;
