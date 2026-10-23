import { Translations, TranslationAnyWithNameKey, Languages } from '@/core/drinks/types/translations';

export const mapToTranslationsName = (
	translations: Translations<TranslationAnyWithNameKey>,
): Translations<TranslationAnyWithNameKey> => {
	const languages = Object.keys(Languages) as Array<keyof typeof Languages>;
	return languages.reduce(
		(accumulator, lang) => ({ ...accumulator, [lang]: { name: translations[lang].name } }),
		{} as Translations<TranslationAnyWithNameKey>,
	);
};
