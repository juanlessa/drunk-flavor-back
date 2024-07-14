import { z } from 'zod';
import { LanguagesEnum, Translations } from '@/core/drinks/types/translations';

/**
 * Generates a Zod schema for translations.
 *
 * @param schema - The Zod schema to validate each language.
 * @returns A Zod object schema with translations for each language defined in LanguagesEnum.
 */
export const generateTranslationsSchema = <Schema extends z.ZodType>(schema: Schema) => {
	const languages = Object.keys(LanguagesEnum) as Array<keyof typeof LanguagesEnum>;
	const translationsSchema = languages.reduce(
		(accumulator, lang) => ({ ...accumulator, [lang]: schema }),
		{} as Translations<Schema>,
	);

	return z.object(translationsSchema);
};

/**
 * Generates a Zod validation schema for specified translations fields.
 *
 * @param translationSchema - The base schema for the translations.
 * @param fields - An array of fields that need validation.
 * @param fieldSchema - The Zod schema to validate the specified fields.
 * @returns A Zod object schema with the specified fields validation rules.
 */
export const generateTranslationsFieldSchema = <
	Schema extends z.ZodTypeAny,
	Field extends keyof z.infer<Schema>,
	Validation extends z.ZodTypeAny,
>(
	_translationSchema: Schema,
	fields: Field[],
	fieldSchema: Validation,
) => {
	const languages = Object.keys(LanguagesEnum) as Array<keyof typeof LanguagesEnum>;

	const fieldsSchema = fields.reduce<Record<string, Validation>>((acc, field) => {
		languages.forEach((lang) => {
			acc[`translations.${lang}.${String(field)}`] = fieldSchema;
		});
		return acc;
	}, {});

	return z.object(fieldsSchema);
};
