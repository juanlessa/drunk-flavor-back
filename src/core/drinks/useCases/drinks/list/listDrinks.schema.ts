import { generateTranslationsFieldSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import { sortOrderSchema, searchTermSchema, limitSchema, pageSchema } from '@/shared/schemas/query.schemas';
import { stringifiedJSONSchema } from '@/shared/schemas/stringified.schemas';
import { z } from 'zod/v4';
import { drinkTranslationSchema } from '@/core/drinks/schemas/drink.schemas';

const searchSchema = z.object({
	...generateTranslationsFieldSchema(drinkTranslationSchema, ['name'], searchTermSchema).shape,
});

const sortSchema = z.object({
	...generateTranslationsFieldSchema(drinkTranslationSchema, ['name'], sortOrderSchema).shape,
});

export const listDrinksSchema = z.object({
	limit: limitSchema,
	page: pageSchema,
	search: stringifiedJSONSchema(searchSchema).optional(),
	sort: stringifiedJSONSchema(sortSchema).optional(),
});
