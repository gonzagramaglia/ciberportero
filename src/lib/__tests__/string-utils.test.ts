import { describe, it, expect } from 'vitest';
import { normalizeString } from '../string-utils';

describe('normalizeString', () => {
  it('converts to lowercase', () => {
    expect(normalizeString('HELLO')).toBe('hello');
  });

  it('removes accents', () => {
    expect(normalizeString('café')).toBe('cafe');
    expect(normalizeString('Ñoño')).toBe('nono');
    expect(normalizeString('ángél')).toBe('angel');
  });

  it('handles combined transformations', () => {
    expect(normalizeString('INFORMACIÓN')).toBe('informacion');
  });

  it('handles empty string', () => {
    expect(normalizeString('')).toBe('');
  });

  it('handles strings without accents', () => {
    expect(normalizeString('normal')).toBe('normal');
  });
});
