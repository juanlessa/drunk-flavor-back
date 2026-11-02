import en from '@/shared/locales/en.json';
import pt from '@/shared/locales/pt.json';
import type { LocaleKey } from '@/shared/types/locale.types';
import { createI18n } from './i18n.lib';

export const DEFAULT_LOCALE = 'en';

/**
 * Every catalog must have the same shape as the default one, so the compiler rejects a locale file that is
 * missing a key. Extra keys and empty values are caught by the locale parity test.
 */
const CATALOGS = { en, pt } satisfies Record<string, typeof en>;

export const i18n = createI18n({ catalogs: CATALOGS, defaultLocale: DEFAULT_LOCALE });

export const isLocaleKey = (value: unknown): value is LocaleKey => typeof value === 'string' && i18n.has(value);
