import { ITranslations, ITranslationsName, LANGUAGES } from '../types/translations';

export const mapToTranslationsName = (
	translations: ITranslations<ITranslationsName>
): ITranslations<ITranslationsName> => {
	const languages = Object.values(LANGUAGES);
	return languages.reduce(
		(accumulator, lang) => ({ ...accumulator, [lang]: { name: translations[lang].name } }),
		{} as ITranslations<ITranslationsName>
	);
};
