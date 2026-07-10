import { es } from './es';
import { en } from './en';
import { pt } from './pt';

export const translations = { es, en, pt };

export type Locale = keyof typeof translations;
