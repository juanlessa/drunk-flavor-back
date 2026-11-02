import { i18n } from '@/infrastructure/i18n';
import type { I18nPluginOptions } from '@/infrastructure/i18n/i18n.types';

export const I18N_OPTIONS = {
	defaultLocale: i18n.defaultLocale,
	supportedLocales: i18n.supportedLocales,
} satisfies I18nPluginOptions;
