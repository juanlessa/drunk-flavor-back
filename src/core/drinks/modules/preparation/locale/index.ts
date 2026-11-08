import { Language } from '@/core/drinks/types/translations';
import { en } from './en';
import { pt } from './pt';
import { PreparationLocale } from './types';

/** One entry per language: adding a language to `Languages` fails here until it has a locale. */
export const preparationLocales: Record<Language, PreparationLocale> = { en, pt };
