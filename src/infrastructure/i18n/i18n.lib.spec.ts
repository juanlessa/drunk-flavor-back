import { describe, expect, it } from 'vitest';
import { createI18n, flattenMessages } from './i18n.lib';

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

describe('flattenMessages', () => {
	it('turns nested objects into dotted paths', () => {
		expect(flattenMessages({ a: { b: { c: 'deep' }, d: 'mid' }, e: 'top' })).toEqual({
			'a.b.c': 'deep',
			'a.d': 'mid',
			e: 'top',
		});
	});

	it('keeps an already flat catalog unchanged', () => {
		expect(flattenMessages({ greeting: 'Hello' })).toEqual({ greeting: 'Hello' });
	});

	it('rejects a segment that contains the path separator', () => {
		expect(() => flattenMessages({ 'a.b': 'x' })).toThrow('invalid key segment "a.b"');
	});

	it('rejects an empty segment', () => {
		expect(() => flattenMessages({ a: { '': 'x' } })).toThrow('invalid key segment ""');
	});

	it.each([
		['a number', 1],
		['null', null],
		['an array', ['x']],
		['a boolean', true],
	])('rejects a leaf that is %s', (_name, value) => {
		expect(() => flattenMessages({ a: value } as never)).toThrow('"a" must be a string or an object');
	});
});

describe('createI18n with nested catalogs', () => {
	const nested = createI18n({
		catalogs: {
			en: { errors: { notFound: 'Not found', range: 'Between {min} and {max}' } },
			pt: { errors: { notFound: 'Não encontrado' } },
		},
		defaultLocale: 'en',
	});

	it('resolves dotted paths into the nested catalog', () => {
		expect(nested.translate('pt', 'errors.notFound')).toBe('Não encontrado');
	});

	it('falls back per key to the default catalog', () => {
		expect(nested.translate('pt', 'errors.range', { min: 1, max: 5 })).toBe('Between 1 and 5');
	});

	it('does not resolve a branch of the tree as a message', () => {
		expect(nested.has('errors')).toBe(false);
		expect(nested.translate('en', 'errors')).toBe('errors');
	});

	it('reports nested keys through has', () => {
		expect(nested.has('errors.notFound')).toBe(true);
	});
});
