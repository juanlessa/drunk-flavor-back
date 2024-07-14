import { Schema } from 'mongoose';
import { TranslationName, Translations, LanguagesEnum } from '@/core/drinks/types/translations';
import { TranslationSchema } from '../types/translations.types';
import { DeepPartial } from '@/shared/types/utility.types';

export const getNameCompareQuery = (names: DeepPartial<Translations<TranslationName>>) => {
	const languages = Object.keys(LanguagesEnum) as (keyof Translations<TranslationName>)[];
	const query = languages
		.filter((lang) => names[lang]?.name !== undefined)
		.map((lang) => ({ [`translations.${lang}.name`]: names[lang]?.name }));
	return query;
};

export const getTranslationsSchema = (schema: Schema) => {
	const languages = Object.keys(LanguagesEnum) as (keyof Translations<TranslationSchema>)[];

	const translationsSchema: Translations<TranslationSchema> = languages.reduce(
		(accumulator, lang) => ({ ...accumulator, [lang]: { type: schema, required: true } }),
		{} as Translations<TranslationSchema>,
	);

	return new Schema(
		{
			...translationsSchema,
		},
		{
			_id: false,
		},
	);
};
