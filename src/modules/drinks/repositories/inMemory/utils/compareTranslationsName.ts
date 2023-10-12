import {
	ITranslations,
	ITranslationAnyWithNameKey,
	LANGUAGES,
	ITranslationName
} from '@modules/drinks/types/translations';

export const compareTranslationsName = <T>(
	translations: ITranslations<ITranslationAnyWithNameKey>,
	namesToCompare: ITranslations<ITranslationName>
): boolean => {
	const languages = Object.values(LANGUAGES);

	return languages.some((lang) => translations[lang].name === namesToCompare[lang].name);
};
