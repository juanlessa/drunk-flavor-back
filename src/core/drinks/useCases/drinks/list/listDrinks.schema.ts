import { generateTranslationsFieldSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import { sortOrderSchema, searchTermSchema, limitSchema, pageSchema } from '@/shared/schemas/query.schemas';
import { stringifiedJSONSchema } from '@/shared/schemas/stringified.schemas';
import { z } from 'zod/v4';
import { drinkTranslationSchema } from '@/core/drinks/schemas/drink.schemas';

const searchSchema = z.object({
	name: searchTermSchema,
	...generateTranslationsFieldSchema(drinkTranslationSchema, ['name'], searchTermSchema).shape,
});

// The keys keep the order they are sent in: the first one sorts, the next ones break the ties,
// e.g. `{"avgRating":"desc","translations.pt.name":"asc"}` for the best rated first, by name among equals.
const sortSchema = z.object({
	avgRating: sortOrderSchema,
	...generateTranslationsFieldSchema(drinkTranslationSchema, ['name'], sortOrderSchema).shape,
});

export const listDrinksSchema = z.object({
	limit: limitSchema,
	page: pageSchema,
	search: stringifiedJSONSchema(searchSchema).optional(),
	sort: stringifiedJSONSchema(sortSchema).optional(),
});
