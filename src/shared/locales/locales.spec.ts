import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { flattenMessages } from '@/infrastructure/i18n/i18n.lib';
import en from './en.json';
import pt from './pt.json';

const DEFAULT_LOCALE = 'en';
const CATALOGS = { en, pt };

// Placeholders that request validation exposes as `params` (see `toFieldParams` in fastifyError.ts).
const ALLOWED_PLACEHOLDERS = ['min', 'max'];

const flat = Object.fromEntries(
	Object.entries(CATALOGS).map(([locale, messages]) => [locale, flattenMessages(messages)]),
);
const defaultFlat = flat[DEFAULT_LOCALE];
const placeholdersOf = (message: string) => [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe.each(Object.keys(CATALOGS).filter((locale) => locale !== DEFAULT_LOCALE))('locale "%s"', (locale) => {
	const catalog = flat[locale];

	it('defines every key of the default catalog', () => {
		const missing = Object.keys(defaultFlat).filter((key) => !Object.hasOwn(catalog, key));

		expect(missing).toEqual([]);
	});

	it('defines no key that the default catalog lacks', () => {
		const extra = Object.keys(catalog).filter((key) => !Object.hasOwn(defaultFlat, key));

		expect(extra).toEqual([]);
	});

	it('uses the same placeholders as the default catalog for every key', () => {
		const mismatched = Object.keys(defaultFlat)
			.filter((key) => Object.hasOwn(catalog, key))
			.filter((key) => placeholdersOf(defaultFlat[key]).join() !== placeholdersOf(catalog[key]).join());

		expect(mismatched).toEqual([]);
	});
});

describe.each(Object.keys(CATALOGS))('catalog "%s"', (locale) => {
	const catalog = flat[locale];

	it('is valid nested JSON with string leaves only', () => {
		expect(() => flattenMessages(CATALOGS[locale as keyof typeof CATALOGS])).not.toThrow();
	});

	it('has no empty values and no leading or trailing whitespace', () => {
		const invalid = Object.entries(catalog)
			.filter(([, message]) => message.trim() === '' || message !== message.trim())
			.map(([key]) => key);

		expect(invalid).toEqual([]);
	});

	it('only uses placeholders that validation errors provide as params', () => {
		const unknown = Object.entries(catalog).flatMap(([key, message]) =>
			placeholdersOf(message)
				.filter((placeholder) => !ALLOWED_PLACEHOLDERS.includes(placeholder))
				.map((placeholder) => `${key}: {${placeholder}}`),
		);

		expect(unknown).toEqual([]);
	});
});

describe('default catalog usage', () => {
	const SRC_ROOT = join(__dirname, '..', '..');
	const isSpec = (file: string) => /spec\.ts$/.test(file);
	const isCatalog = (file: string) => file.includes(`${join('shared', 'locales')}`);

	const readSources = (directory: string): string[] =>
		readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
			const path = join(directory, entry.name);
			if (entry.isDirectory()) return readSources(path);
			return entry.name.endsWith('.ts') && !isSpec(path) && !isCatalog(path) ? [readFileSync(path, 'utf8')] : [];
		});

	it('has no key that production code never references', () => {
		const source = readSources(SRC_ROOT).join('\n');
		const unused = Object.keys(defaultFlat).filter(
			(key) => !["'", '"', '`'].some((quote) => source.includes(`${quote}${key}${quote}`)),
		);

		expect(
			unused,
			'Remove dead keys from every locale file, or wire them to the error that should use them',
		).toEqual([]);
	});
});
