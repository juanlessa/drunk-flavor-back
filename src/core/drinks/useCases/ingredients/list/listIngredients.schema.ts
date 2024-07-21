import { ingredientTranslationSchema } from '@/core/drinks/schemas/ingredient.schemas';
import { generateTranslationsFieldSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import { sortOrderSchema, searchTermSchema } from '@/shared/schemas/query.schemas';
import { stringifiedJSONSchema } from '@/shared/schemas/stringified.schemas';
import { z } from 'zod';

const searchSchema = z.object({
	...generateTranslationsFieldSchema(ingredientTranslationSchema, ['name'], searchTermSchema).shape,
});

const sortSchema = z.object({
	...generateTranslationsFieldSchema(ingredientTranslationSchema, ['name'], sortOrderSchema).shape,
});

export const listIngredientsSchema = z.object({
	limit: z.coerce.number().optional(),
	page: z.coerce.number().optional(),
	search: stringifiedJSONSchema(searchSchema).optional(),
	sort: stringifiedJSONSchema(sortSchema).optional(),
});
