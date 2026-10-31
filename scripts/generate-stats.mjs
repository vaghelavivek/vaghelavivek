// Generates every dynamic profile image: header, highlights, GitHub stats and heatmap.
// Usage: GITHUB_TOKEN=... node scripts/generate-stats.mjs <login> <out-dir>
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchContributions } from './lib/github.mjs';
import { experienceYears, resolveHighlights, validateConfig } from './lib/highlights.mjs';
import { computeStats, mergeDays } from './lib/streaks.mjs';
import { renderHeatmap, renderHighlights, renderStatsCard } from './lib/svg.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

async function loadConfig() {
  const raw = await readFile(join(ROOT, 'profile.config.json'), 'utf8');
  try {
    return validateConfig(JSON.parse(raw));
  } catch (error) {
    throw new Error(error instanceof SyntaxError ? `profile.config.json is not valid JSON: ${error.message}` : error.message);
  }
}

async function renderHeader(config, now) {
  const template = await readFile(join(ROOT, 'assets', 'header.template.svg'), 'utf8');
  if (!template.includes('{{EXPERIENCE_YEARS}}')) throw new Error('header.template.svg is missing {{EXPERIENCE_YEARS}}');
  return template.replaceAll('{{EXPERIENCE_YEARS}}', String(experienceYears(config.experience, now)));
}

async function main() {
  const [login, outDir] = process.argv.slice(2);
  const token = process.env.GITHUB_TOKEN;
  if (!login || !outDir) throw new Error('Usage: node scripts/generate-stats.mjs <login> <out-dir>');
  if (!token) throw new Error('GITHUB_TOKEN is not set');

  const now = new Date();
  const config = await loadConfig();
  const { yearDays, heatmapDays } = await fetchContributions(token, login, now);
  const stats = computeStats(mergeDays(yearDays), now.toISOString().slice(0, 10));
  const lastYearTotal = heatmapDays.reduce((total, d) => total + d.count, 0);

  // Refuse to publish an empty card: a failed run keeps the last good images live.
  if (stats.total === 0 || heatmapDays.length < 300) {
    throw new Error(`Suspicious data (total=${stats.total}, days=${heatmapDays.length}); not publishing`);
  }

  const files = {
    'header.svg': await renderHeader(config, now),
    'highlights.svg': renderHighlights(resolveHighlights(config, now), config.manualFiguresAsOf),
    'stats.svg': renderStatsCard(stats, now),
    'heatmap.svg': renderHeatmap(heatmapDays, lastYearTotal),
  };

  await mkdir(outDir, { recursive: true });
  await Promise.all(Object.entries(files).map(([name, svg]) => writeFile(join(outDir, name), svg)));
  console.log(JSON.stringify({ ...stats, lastYearTotal, experienceYears: experienceYears(config.experience, now), generatedAt: now.toISOString() }));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
