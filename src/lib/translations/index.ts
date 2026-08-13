import { es } from './es';
import { en } from './en';

export const translations = { es, en };

export type Locale = keyof typeof translations;

export function normalizeLang(lang?: string): Locale {
  if (!lang) return 'es';
  const l = lang.toLowerCase();
  if (l.startsWith('en')) return 'en';
  return 'es'; // default
}
