import { describe, expect, it } from 'vitest';
import { mapToTranslationsName } from './translations.mappers';
import { Translations, TranslationAnyWithNameKey } from '@/core/drinks/types/translations';

describe('mapToTranslationsName', () => {
	it('projects each language to a name-only object, dropping extra keys', () => {
		const translations: Translations<TranslationAnyWithNameKey> = {
			en: { name: 'Old Fashioned', method: 'Stir with ice' },
			pt: { name: 'Old Fashioned', method: 'Mexa com gelo' },
		};

		expect(mapToTranslationsName(translations)).toEqual({
			en: { name: 'Old Fashioned' },
			pt: { name: 'Old Fashioned' },
		});
	});

	it('drops unit-specific name_plural keys', () => {
		const translations: Translations<TranslationAnyWithNameKey> = {
			en: { name: 'milliliter', name_plural: 'milliliters' },
			pt: { name: 'mililitro', name_plural: 'mililitros' },
		};

		expect(mapToTranslationsName(translations)).toEqual({
			en: { name: 'milliliter' },
			pt: { name: 'mililitro' },
		});
	});

	it('returns a new object and does not mutate the input', () => {
		const translations: Translations<TranslationAnyWithNameKey> = {
			en: { name: 'Lime' },
			pt: { name: 'Limão' },
		};

		const result = mapToTranslationsName(translations);

		expect(result).not.toBe(translations);
		expect(result.en).not.toBe(translations.en);
		expect(translations.en).toEqual({ name: 'Lime' });
	});
});
