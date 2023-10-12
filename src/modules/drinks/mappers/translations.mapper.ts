import { ITranslations, ITranslationAnyWithNameKey, LANGUAGES } from '../types/translations';

export const mapToTranslationsName = (
	translations: ITranslations<ITranslationAnyWithNameKey>
): ITranslations<ITranslationAnyWithNameKey> => {
	const languages = Object.values(LANGUAGES);
	return languages.reduce(
		(accumulator, lang) => ({ ...accumulator, [lang]: { name: translations[lang].name } }),
		{} as ITranslations<ITranslationAnyWithNameKey>
	);
};
