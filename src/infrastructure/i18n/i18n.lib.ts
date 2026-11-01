import type { FlatMessages, I18n, I18nOptions, NestedMessages, TranslateParams } from './i18n.types';

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

const interpolate = (template: string, params?: TranslateParams): string => {
	if (!params) return template;
	return template.replace(PLACEHOLDER_PATTERN, (placeholder, name: string) =>
		Object.hasOwn(params, name) ? String(params[name]) : placeholder,
	);
};

const isPlainObject = (value: unknown): value is NestedMessages =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const toEntries = (path: string, value: unknown): Record<string, string> => {
	if (typeof value === 'string') return { [path]: value };
	if (isPlainObject(value)) return flattenMessages(value, `${path}.`);
	throw new Error(`i18n: "${path}" must be a string or an object`);
};

/**
 * Flattens a nested catalog into dotted paths: `{ a: { b: 'x' } }` becomes `{ 'a.b': 'x' }`.
 * Throws on leaves that are neither strings nor objects and on empty segments or segments that contain a dot.
 * Because the dot is reserved as the separator, every flattened path is unique by construction.
 */
export const flattenMessages = (messages: NestedMessages, prefix = ''): Record<string, string> => {
	const flat: Record<string, string> = {};

	for (const [segment, value] of Object.entries(messages)) {
		if (segment === '' || segment.includes('.')) {
			throw new Error(
				`i18n: invalid key segment "${segment}" at "${prefix}"; segments must be non-empty and dot-free`,
			);
		}

		Object.assign(flat, toEntries(`${prefix}${segment}`, value));
	}

	return flat;
};

// `hasOwn` guards against prototype keys such as "constructor" or "__proto__".
const lookup = (catalogs: Readonly<Record<string, FlatMessages>>, locale: string, key: string): string | undefined => {
	if (!Object.hasOwn(catalogs, locale)) return undefined;
	const messages = catalogs[locale];
	return Object.hasOwn(messages, key) ? messages[key] : undefined;
};

/**
 * Builds an i18n instance from immutable catalogs.
 * The instance holds no per-request state: the locale is always an explicit argument,
 * so concurrent requests with different locales can never affect each other.
 */
export const createI18n = ({ catalogs: nestedCatalogs, defaultLocale }: I18nOptions): I18n => {
	if (!Object.hasOwn(nestedCatalogs, defaultLocale)) {
		throw new Error(`i18n: default locale "${defaultLocale}" has no catalog`);
	}

	const catalogs: Readonly<Record<string, FlatMessages>> = Object.freeze(
		Object.fromEntries(
			Object.entries(nestedCatalogs).map(([locale, messages]) => [
				locale,
				Object.freeze(flattenMessages(messages)),
			]),
		),
	);

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
