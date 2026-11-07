import { z } from 'zod/v4';
import { Language, Languages, Translations } from '@/core/drinks/types/translations';
import { Gender } from '@/shared/types/gender.types';
import { LocaleKey } from '@/shared/types/locale.types';

/**
 * Generates a Zod schema for translations.
 *
 * @param schema - The Zod schema to validate each language.
 * @returns A Zod object schema with translations for each language defined in Languages.
 */
export const generateTranslationsSchema = <Schema extends z.ZodType>(schema: Schema) => {
	const languages = Object.keys(Languages) as Array<keyof typeof Languages>;
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
	Schema extends z.ZodType,
	Field extends keyof z.infer<Schema>,
	Validation extends z.ZodType,
>(
	_translationSchema: Schema,
	fields: Field[],
	fieldSchema: Validation,
) => {
	const languages = Object.keys(Languages) as Array<keyof typeof Languages>;

	const fieldsSchema = fields.reduce<Record<string, Validation>>((acc, field) => {
		languages.forEach((lang) => {
			acc[`translations.${lang}.${String(field)}`] = fieldSchema;
		});
		return acc;
	}, {});

	return z.object(fieldsSchema);
};

/**
 * Builds a `superRefine` callback for a translations object that requires the grammatical gender
 * in the given languages. Languages that are not listed keep the gender optional.
 *
 * @example
 * generateTranslationsSchema(unitTranslationSchema).superRefine(requireGenderFor(Languages.pt));
 */
export const requireGenderFor =
	(...languages: Language[]) =>
	(translations: Partial<Record<Language, { gender?: Gender }>>, ctx: z.RefinementCtx): void => {
		languages.forEach((language) => {
			if (translations[language]?.gender !== undefined) return;
			ctx.addIssue({
				code: 'custom',
				message: 'apiResponses.validation.requiredGender' satisfies LocaleKey,
				path: [language, 'gender'],
			});
		});
	};
