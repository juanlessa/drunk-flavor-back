import { ingredientTranslationSchema } from '@/core/drinks/schemas/ingredient.schemas';
import { generateTranslationsFieldSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import { sortOrderSchema, searchTermSchema, limitSchema, pageSchema } from '@/shared/schemas/query.schemas';
import { stringifiedJSONSchema } from '@/shared/schemas/stringified.schemas';
import { z } from 'zod/v4';

const searchSchema = z.object({
	name: searchTermSchema,
	...generateTranslationsFieldSchema(ingredientTranslationSchema, ['name'], searchTermSchema).shape,
});

const sortSchema = z.object({
	...generateTranslationsFieldSchema(ingredientTranslationSchema, ['name'], sortOrderSchema).shape,
});

/** What every ingredient listing accepts. */
export const listIngredientsQuerySchema = z.object({
	limit: limitSchema,
	page: pageSchema,
	search: stringifiedJSONSchema(searchSchema).optional(),
	sort: stringifiedJSONSchema(sortSchema).optional(),
});

export const listIngredientsSchema = listIngredientsQuerySchema.extend({
	inUse: z
		.enum(['true', 'false'])
		.transform((value) => value === 'true')
		.optional(),
});
