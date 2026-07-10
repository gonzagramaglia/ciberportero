import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { timeAgo, toLocalISOString, getFirstName, slugify, formatMarkdown } from '../utils';

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "hace un momento" for less than 60 seconds (es)', () => {
    const date = new Date('2026-07-10T11:59:30Z');
    expect(timeAgo(date)).toBe('hace un momento');
  });

  it('returns "just now" for less than 60 seconds (en)', () => {
    const date = new Date('2026-07-10T11:59:30Z');
    expect(timeAgo(date, 'en')).toBe('just now');
  });

  it('returns "hace 1 minuto" for exactly 1 minute', () => {
    const date = new Date('2026-07-10T11:59:00Z');
    expect(timeAgo(date)).toBe('hace 1 minuto');
  });

  it('returns plural minutes', () => {
    const date = new Date('2026-07-10T11:55:00Z');
    expect(timeAgo(date)).toBe('hace 5 minutos');
  });

  it('returns "hace 1 hora" for exactly 1 hour', () => {
    const date = new Date('2026-07-10T11:00:00Z');
    expect(timeAgo(date)).toBe('hace 1 hora');
  });

  it('returns plural hours', () => {
    const date = new Date('2026-07-10T09:00:00Z');
    expect(timeAgo(date)).toBe('hace 3 horas');
  });

  it('returns "hace 1 día" for 1 day', () => {
    const date = new Date('2026-07-09T12:00:00Z');
    expect(timeAgo(date)).toBe('hace 1 día');
  });

  it('returns plural days', () => {
    const date = new Date('2026-07-07T12:00:00Z');
    expect(timeAgo(date)).toBe('hace 3 días');
  });

  it('returns "hace 1 semana" for 7 days', () => {
    const date = new Date('2026-07-03T12:00:00Z');
    expect(timeAgo(date)).toBe('hace 1 semana');
  });

  it('returns plural weeks', () => {
    const date = new Date('2026-06-19T12:00:00Z');
    expect(timeAgo(date)).toBe('hace 3 semanas');
  });

  it('returns "hace 1 mes" for ~30 days', () => {
    const date = new Date('2026-06-10T12:00:00Z');
    expect(timeAgo(date)).toBe('hace 1 mes');
  });

  it('returns plural months', () => {
    const date = new Date('2026-04-10T12:00:00Z');
    expect(timeAgo(date)).toBe('hace 3 meses');
  });

  it('returns "hace 1 año" for ~365 days', () => {
    const date = new Date('2025-07-10T12:00:00Z');
    expect(timeAgo(date)).toBe('hace 1 año');
  });

  it('returns plural years', () => {
    const date = new Date('2024-01-10T12:00:00Z');
    expect(timeAgo(date)).toBe('hace 2 años');
  });

  it('supports Portuguese', () => {
    const date = new Date('2026-07-10T11:59:30Z');
    expect(timeAgo(date, 'pt')).toBe('agora mesmo');
  });

  it('falls back to Spanish for unknown language', () => {
    const date = new Date('2026-07-10T11:59:30Z');
    expect(timeAgo(date, 'fr')).toBe('hace un momento');
  });

  it('accepts string dates', () => {
    expect(timeAgo('2026-07-10T11:59:30Z')).toBe('hace un momento');
  });
});

describe('toLocalISOString', () => {
  it('returns datetime format by default (length 16)', () => {
    const date = new Date(2026, 6, 10, 14, 30); // July 10, 2026 14:30
    const result = toLocalISOString(date);
    expect(result).toBe('2026-07-10T14:30');
  });

  it('returns date-only format with length 10', () => {
    const date = new Date(2026, 6, 10, 14, 30);
    const result = toLocalISOString(date, 10);
    expect(result).toBe('2026-07-10');
  });

  it('handles string input', () => {
    const result = toLocalISOString('2026-01-15T08:05:00');
    expect(result).toMatch(/2026-01-15T08:05/);
  });

  it('returns empty string for falsy input', () => {
    expect(toLocalISOString('')).toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(toLocalISOString('not-a-date')).toBe('');
  });

  it('pads single-digit months and days', () => {
    const date = new Date(2026, 0, 5, 3, 7); // Jan 5, 2026 03:07
    expect(toLocalISOString(date)).toBe('2026-01-05T03:07');
  });
});

describe('getFirstName', () => {
  it('returns first name from a full name', () => {
    expect(getFirstName('Gonzalo Gramaglia')).toBe('Gonzalo');
  });

  it('returns the name when there is only one word', () => {
    expect(getFirstName('Gonzalo')).toBe('Gonzalo');
  });

  it('returns "Estudiante" for null', () => {
    expect(getFirstName(null)).toBe('Estudiante');
  });

  it('returns "Estudiante" for undefined', () => {
    expect(getFirstName(undefined)).toBe('Estudiante');
  });

  it('returns "Estudiante" for empty string', () => {
    expect(getFirstName('   ')).toBe('Estudiante');
  });

  it('returns "Estudiante" for non-string values', () => {
    expect(getFirstName(123)).toBe('Estudiante');
  });

  it('trims whitespace before splitting', () => {
    expect(getFirstName('  Juan Perez  ')).toBe('Juan');
  });
});

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('HELLO')).toBe('hello');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('removes accents', () => {
    expect(slugify('café con leche')).toBe('cafe-con-leche');
  });

  it('removes special characters', () => {
    expect(slugify('hello! @world#')).toBe('hello-world');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('trims whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles complex strings', () => {
    expect(slugify('Seguridad en la Nube (2026)')).toBe('seguridad-en-la-nube-2026');
  });
});

describe('formatMarkdown', () => {
  it('converts **bold** to <strong>', () => {
    expect(formatMarkdown('**hello**')).toBe('<strong>hello</strong>');
  });

  it('converts *bold* to <strong>', () => {
    expect(formatMarkdown('*hello*')).toBe('<strong>hello</strong>');
  });

  it('converts _italic_ to <em>', () => {
    expect(formatMarkdown('_hello_')).toBe('<em>hello</em>');
  });

  it('converts newlines to <br />', () => {
    expect(formatMarkdown('hello\nworld')).toBe('hello<br />world');
  });

  it('returns empty string for null', () => {
    expect(formatMarkdown(null as any)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatMarkdown('')).toBe('');
  });

  it('returns empty string for non-string values', () => {
    expect(formatMarkdown(123 as any)).toBe('');
  });

  it('handles mixed formatting', () => {
    const input = '**bold** and _italic_\nnew line';
    const expected = '<strong>bold</strong> and <em>italic</em><br />new line';
    expect(formatMarkdown(input)).toBe(expected);
  });
});
