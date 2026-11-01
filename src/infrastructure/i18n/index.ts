import en from '@/shared/locales/en.json';
import type { LocaleKey } from '@/shared/types/locale.types';
import { createI18n } from './i18n.lib';

export const DEFAULT_LOCALE = 'en';
const CATALOGS: Record<typeof DEFAULT_LOCALE, Record<LocaleKey, string>> = { en };

export const i18n = createI18n({ catalogs: CATALOGS, defaultLocale: DEFAULT_LOCALE });

export const isLocaleKey = (value: unknown): value is LocaleKey => typeof value === 'string' && i18n.has(value);
