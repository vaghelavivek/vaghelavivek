import { test } from 'node:test';
import assert from 'node:assert/strict';
import { experienceYears, resolveHighlights, validateConfig, yearsSince } from './highlights.mjs';

const at = (iso) => new Date(`${iso}T12:00:00Z`);

test('yearsSince counts whole years only', () => {
  assert.equal(yearsSince('2022-07', at('2026-06-30')), 3);
  assert.equal(yearsSince('2022-07', at('2026-07-01')), 4);
});

test('yearsSince never goes negative', () => {
  assert.equal(yearsSince('2030-01', at('2026-10-31')), 0);
});

test('experience grows by one each 12 months after asOf', () => {
  const experience = { years: 7, asOf: '2026-10' };
  assert.equal(experienceYears(experience, at('2026-10-31')), 7);
  assert.equal(experienceYears(experience, at('2027-09-30')), 7);
  assert.equal(experienceYears(experience, at('2027-10-01')), 8);
});

const validConfig = () => ({
  experience: { years: 7, asOf: '2026-10' },
  manualFiguresAsOf: '2026-10',
  highlights: [
    { experience: true, label: 'years' },
    { value: '5', label: 'products' },
    { yearsSince: '2022-07', label: 'on one SaaS' },
    { value: '100%', label: 'Job Success' },
  ],
});

test('resolveHighlights computes dynamic values and keeps manual ones', () => {
  const values = resolveHighlights(validConfig(), at('2026-10-31')).map((h) => h.value);
  assert.deepEqual(values, ['7+', '5', '4+', '100%']);
});

test('validateConfig accepts a valid config', () => {
  assert.doesNotThrow(() => validateConfig(validConfig()));
});

test('validateConfig rejects bad months, mixed kinds and odd counts', () => {
  const badMonth = { ...validConfig(), experience: { years: 7, asOf: '2026-13' } };
  assert.throws(() => validateConfig(badMonth), /experience.asOf/);

  const mixed = validConfig();
  mixed.highlights[1] = { value: '5', yearsSince: '2020-01', label: 'x' };
  assert.throws(() => validateConfig(mixed), /exactly one/);

  const odd = validConfig();
  odd.highlights.pop();
  assert.throws(() => validateConfig(odd), /4 or 8/);
});
