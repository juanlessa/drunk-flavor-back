import type { I18n, I18nOptions, Messages, TranslateParams } from './i18n.types';

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

const interpolate = (template: string, params?: TranslateParams): string => {
	if (!params) return template;
	return template.replace(PLACEHOLDER_PATTERN, (placeholder, name: string) =>
		Object.hasOwn(params, name) ? String(params[name]) : placeholder,
	);
};

// `hasOwn` guards against prototype keys such as "constructor" or "__proto__".
const lookup = (catalogs: I18nOptions['catalogs'], locale: string, key: string): string | undefined => {
	if (!Object.hasOwn(catalogs, locale)) return undefined;
	const messages: Messages = catalogs[locale];
	return Object.hasOwn(messages, key) ? messages[key] : undefined;
};

/**
 * Builds an i18n instance from immutable catalogs.
 * The instance holds no per-request state: the locale is always an explicit argument,
 * so concurrent requests with different locales can never affect each other.
 */
export const createI18n = ({ catalogs, defaultLocale }: I18nOptions): I18n => {
	const defaultMessages = catalogs[defaultLocale];
	if (!defaultMessages) {
		throw new Error(`i18n: default locale "${defaultLocale}" has no catalog`);
	}

	const supportedLocales = Object.freeze([
		defaultLocale,
		...Object.keys(catalogs).filter((locale) => locale !== defaultLocale),
	]);

	const translate: I18n['translate'] = (locale, key, params) => {
		const template = lookup(catalogs, locale, key) ?? lookup(catalogs, defaultLocale, key);
		return template === undefined ? key : interpolate(template, params);
	};

	const has: I18n['has'] = (key) => lookup(catalogs, defaultLocale, key) !== undefined;

	return Object.freeze({ defaultLocale, supportedLocales, has, translate });
};
