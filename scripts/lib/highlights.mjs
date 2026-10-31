const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const monthIndex = (yyyyMm) => {
  const [year, month] = yyyyMm.split('-').map(Number);
  return year * 12 + (month - 1);
};

/** Whole years elapsed since a YYYY-MM month, never negative. */
export function yearsSince(yyyyMm, now) {
  const elapsed = now.getUTCFullYear() * 12 + now.getUTCMonth() - monthIndex(yyyyMm);
  return Math.max(0, Math.floor(elapsed / 12));
}

/** Stated experience on a given month, plus every full year since then. */
export function experienceYears({ years, asOf }, now) {
  return years + yearsSince(asOf, now);
}

function fail(message) {
  throw new Error(`profile.config.json: ${message}`);
}

export function validateConfig(config) {
  const { experience, highlights, manualFiguresAsOf } = config ?? {};
  if (!Number.isInteger(experience?.years) || experience.years < 0) fail('experience.years must be a whole number');
  if (!MONTH_PATTERN.test(experience?.asOf ?? '')) fail('experience.asOf must look like "2026-10"');
  if (!MONTH_PATTERN.test(manualFiguresAsOf ?? '')) fail('manualFiguresAsOf must look like "2026-10"');
  if (!Array.isArray(highlights) || highlights.length === 0 || highlights.length % 4 !== 0) {
    fail('highlights must be a list of 4 or 8 items');
  }
  highlights.forEach((item, i) => {
    const kinds = [item.experience === true, typeof item.value === 'string', typeof item.yearsSince === 'string'];
    if (kinds.filter(Boolean).length !== 1) fail(`highlights[${i}] needs exactly one of "experience", "value" or "yearsSince"`);
    if (typeof item.yearsSince === 'string' && !MONTH_PATTERN.test(item.yearsSince)) fail(`highlights[${i}].yearsSince must look like "2022-07"`);
    if (typeof item.label !== 'string' || item.label.trim() === '') fail(`highlights[${i}].label is required`);
  });
  return config;
}

/** Turn config entries into display values; computed ones get a "+". */
export function resolveHighlights(config, now) {
  return config.highlights.map((item) => {
    if (item.experience) return { value: `${experienceYears(config.experience, now)}+`, label: item.label };
    if (item.yearsSince) return { value: `${yearsSince(item.yearsSince, now)}+`, label: item.label };
    return { value: item.value, label: item.label };
  });
}
