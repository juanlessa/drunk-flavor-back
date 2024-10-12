import en from '@/shared/locales/en.json';
import { FastifyI18nOptions } from '../types/i18n.types';

export const I18N_OPTIONS = {
	fallbackLocale: 'en',
	messages: {
		en,
	},
} satisfies FastifyI18nOptions;
