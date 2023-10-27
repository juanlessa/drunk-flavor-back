import { LANGUAGES } from '@modules/drinks/types/translations';
import { z } from 'zod';

export const getZodTranslationsSchema = (schema: z.ZodTypeAny) => {
	return z.object({
		[LANGUAGES.english]: schema,
		[LANGUAGES.portuguese]: schema
	});
};
