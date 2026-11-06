import { CollationOptions } from 'mongodb';
import { IndexOptions, Schema } from 'mongoose';
import { TranslationName, Translations, Languages, Language } from '@/core/drinks/types/translations';
import { TranslationSchema } from '../types/translations.types';
import { DeepPartial } from '@/shared/types/utility.types';

/**
 * Primary-strength collation per language: comparisons ignore case and diacritics,
 * so "Limão", "limao" and "LIMÃO" are the same name.
 * Queries must use the same collation as the index to be able to use it.
 */
export const NAME_COLLATION_BY_LANGUAGE: Readonly<Record<Language, CollationOptions>> = {
	en: { locale: 'en', strength: 1 },
	pt: { locale: 'pt', strength: 1 },
};

/**
 * Index options for the unique, case and diacritic insensitive name index of a language.
 */
export const getNameUniqueIndexOptions = (language: Language, name: string): IndexOptions => ({
	unique: true,
	name,
	collation: NAME_COLLATION_BY_LANGUAGE[language],
});

const TRANSLATED_FIELD_PATTERN = /^translations\.(\w+)\./;

/**
 * Resolves the collation used to sort by a translated field, so accented names follow the
 * language's alphabetical order ("Água" before "Zebra") instead of binary order.
 * The first translated sort field decides the language; other sorts keep the default collation.
 */
export const getSortCollation = (sort: Record<string, unknown> | undefined): CollationOptions | undefined => {
	const language = Object.keys(sort ?? {})
		.map((field) => TRANSLATED_FIELD_PATTERN.exec(field)?.[1])
		.find((value): value is Language => value !== undefined && value in Languages);
	return language ? { locale: language } : undefined;
};

/**
 * Finds the first document whose name matches in any of the given languages.
 * Each language is queried with its own collation so the matching unique index is used.
 */
export const findByTranslatedName = async <T>(
	names: DeepPartial<Translations<TranslationName>>,
	findOne: (filter: Record<string, string>, collation: CollationOptions) => Promise<T | null>,
): Promise<T | null> => {
	const languages = Object.keys(Languages) as Language[];
	for (const language of languages) {
		const name = names[language]?.name;
		if (name === undefined) continue;
		const found = await findOne({ [`translations.${language}.name`]: name }, NAME_COLLATION_BY_LANGUAGE[language]);
		if (found) return found;
	}
	return null;
};

export const getTranslationsSchema = (schema: Schema): Schema => {
	const languages = Object.keys(Languages) as (keyof Translations<TranslationSchema>)[];

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
