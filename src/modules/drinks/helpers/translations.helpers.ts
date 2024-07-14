import {
	Translations,
	TranslationAnyWithNameKey,
	LanguagesEnum,
	TranslationName,
} from '@/modules/drinks/types/translations';
import { DeepPartial } from '@/shared/types/utility.types';

/**
 * Compares translation names across different languages.
 *
 * This function checks if any translation name in the provided `translations` object matches
 * any corresponding name in the `namesToCompare` object for the specified languages in `LanguagesEnum`.
 *
 * @param translations - An object containing translations with keys representing language codes
 * and values containing objects with a `name` property.
 * @param namesToCompare - A partial object of translations to compare, where some languages
 * may be missing. Each language key maps to an object that may contain a `name` property.
 * @returns `true` if any translation name matches a corresponding name in `namesToCompare`, `false` otherwise.
 *
 * @example
 * const translations = {
 *   en: { name: "Hello" },
 *   pt: { name: "Olá" }
 * };
 * const namesToCompare = {
 *   en: { name: "Hello" }
 * };
 * compareTranslationsName(translations, namesToCompare); // true
 */
export const compareTranslationsName = (
	translations: Translations<TranslationAnyWithNameKey>,
	namesToCompare: DeepPartial<Translations<TranslationName>>,
): boolean => {
	const languages = Object.keys(LanguagesEnum) as (keyof Translations<TranslationAnyWithNameKey>)[];

	return languages.some(
		(lang) => namesToCompare[lang]?.name && translations[lang].name === namesToCompare[lang]?.name,
	);
};
