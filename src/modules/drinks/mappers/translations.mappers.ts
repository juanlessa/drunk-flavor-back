import { Translations, TranslationAnyWithNameKey, LanguagesEnum } from '@/modules/drinks/types/translations';

export const mapToTranslationsName = (
	translations: Translations<TranslationAnyWithNameKey>,
): Translations<TranslationAnyWithNameKey> => {
	const languages = Object.keys(LanguagesEnum) as Array<keyof typeof LanguagesEnum>;
	return languages.reduce(
		(accumulator, lang) => ({ ...accumulator, [lang]: { name: translations[lang].name } }),
		{} as Translations<TranslationAnyWithNameKey>,
	);
};
