import { z } from 'zod';
import { LanguagesEnum, Translations } from '@/modules/drinks/types/translations';

export const getZodTranslationsSchema = (schema: z.ZodTypeAny) => {
	const languages = Object.keys(LanguagesEnum) as Array<keyof typeof LanguagesEnum>;
	const translationsSchema = languages.reduce(
		(accumulator, lang) => ({ ...accumulator, [lang]: schema }),
		{} as Translations<z.ZodTypeAny>,
	);

	return z.object(translationsSchema);
};
