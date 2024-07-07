import { z } from 'zod';
import { LanguagesEnum, Translations } from '@/modules/drinks/types/translations';

export const getZodTranslationsSchema = <T extends z.ZodType>(schema: T) => {
	const languages = Object.keys(LanguagesEnum) as Array<keyof typeof LanguagesEnum>;
	const translationsSchema = languages.reduce(
		(accumulator, lang) => ({ ...accumulator, [lang]: schema }),
		{} as Translations<T>,
	);

	return z.object(translationsSchema);
};
