import { ITranslationName, ITranslations, LANGUAGES } from '@modules/drinks/types/translations';

export const getNameCompareQuery = (names: ITranslations<ITranslationName>) => {
	const languages = Object.values(LANGUAGES);
	const query = languages.map((lang) => ({ [`translations.${lang}.name`]: names[lang].name }));
	return query;
};
