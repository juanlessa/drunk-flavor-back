import { describe, expect, it } from 'vitest';
import { compareTranslationsName } from './translations.helpers';
import { Translations, TranslationAnyWithNameKey } from '@/core/drinks/types/translations';

const translations: Translations<TranslationAnyWithNameKey> = {
	en: { name: 'Lime' },
	pt: { name: 'Limão' },
};

describe('compareTranslationsName', () => {
	it('matches when only the en name is equal', () => {
		expect(compareTranslationsName(translations, { en: { name: 'Lime' } })).toBe(true);
	});

	it('matches when only the pt name is equal', () => {
		expect(compareTranslationsName(translations, { pt: { name: 'Limão' } })).toBe(true);
	});

	it('does not match when no language name is equal', () => {
		expect(compareTranslationsName(translations, { en: { name: 'Lemon' }, pt: { name: 'Lima' } })).toBe(false);
	});

	it('does not throw on a partial compare set and matches the present language', () => {
		expect(compareTranslationsName(translations, { en: { name: 'Lime' } })).toBe(true);
		expect(compareTranslationsName(translations, { pt: { name: 'Lima' } })).toBe(false);
	});

	it('ignores an undefined name so it never produces a false positive', () => {
		expect(compareTranslationsName(translations, {})).toBe(false);
		expect(compareTranslationsName(translations, { en: {} })).toBe(false);
	});
});
