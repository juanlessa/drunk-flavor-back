import { describe, expect, it } from 'vitest';
import { createI18n } from './i18n.lib';

const catalogs = {
	en: { greeting: 'Hello', onlyEnglish: 'English only', range: 'Between {min} and {max}' },
	pt: { greeting: 'Olá', range: 'Entre {min} e {max}' },
};

describe('createI18n', () => {
	const i18n = createI18n({ catalogs, defaultLocale: 'en' });

	it('puts the default locale first in the supported locales', () => {
		const ptFirst = createI18n({ catalogs, defaultLocale: 'pt' });

		expect(i18n.supportedLocales).toEqual(['en', 'pt']);
		expect(ptFirst.supportedLocales).toEqual(['pt', 'en']);
	});

	it('throws when the default locale has no catalog', () => {
		expect(() => createI18n({ catalogs, defaultLocale: 'fr' })).toThrow('default locale "fr" has no catalog');
	});

	it('reports whether the default catalog defines a key', () => {
		expect(i18n.has('onlyEnglish')).toBe(true);
		expect(i18n.has('missing.key')).toBe(false);
		expect(i18n.has('constructor')).toBe(false);
	});

	it('translates using the requested locale', () => {
		expect(i18n.translate('pt', 'greeting')).toBe('Olá');
		expect(i18n.translate('en', 'greeting')).toBe('Hello');
	});

	it('falls back to the default locale per key', () => {
		expect(i18n.translate('pt', 'onlyEnglish')).toBe('English only');
	});

	it('falls back to the default locale for an unknown locale', () => {
		expect(i18n.translate('fr', 'greeting')).toBe('Hello');
	});

	it('returns the key itself when no catalog has it', () => {
		expect(i18n.translate('pt', 'missing.key')).toBe('missing.key');
	});

	it('interpolates placeholders', () => {
		expect(i18n.translate('pt', 'range', { min: 1, max: 5 })).toBe('Entre 1 e 5');
	});

	it('keeps placeholders that have no matching param', () => {
		expect(i18n.translate('en', 'range', { min: 1 })).toBe('Between 1 and {max}');
	});

	it('does not resolve prototype keys as locales or messages', () => {
		expect(i18n.translate('__proto__', 'greeting')).toBe('Hello');
		expect(i18n.translate('en', 'constructor')).toBe('constructor');
		expect(i18n.translate('en', '__proto__')).toBe('__proto__');
	});

	it('is a pure function of its arguments across interleaved calls', () => {
		const results = [
			i18n.translate('pt', 'greeting'),
			i18n.translate('en', 'greeting'),
			i18n.translate('pt', 'greeting'),
		];

		expect(results).toEqual(['Olá', 'Hello', 'Olá']);
	});
});
