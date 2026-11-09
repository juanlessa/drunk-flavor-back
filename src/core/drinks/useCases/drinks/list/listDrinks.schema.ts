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
// e.g. `{"ratingScore":"desc","translations.pt.name":"asc"}` for the best rated first, by name among equals.
// - `ratingScore` weighs the average by how many ratings back it (a single 5 does not outrank many 4s);
//   `avgRating` is the plain average.
// - A name sorts by the alphabet of its language, ignoring accents and case ("Ápice" next to "Amora").
// - `createdAt` is when the drink was added. `updatedAt` is its last change of any kind, a new rating included.
// An unknown key is rejected, so a typo does not silently leave the list unsorted.
const sortSchema = z
	.object({
		ratingScore: sortOrderSchema,
		avgRating: sortOrderSchema,
		createdAt: sortOrderSchema,
		updatedAt: sortOrderSchema,
		...generateTranslationsFieldSchema(drinkTranslationSchema, ['name'], sortOrderSchema).shape,
	})
	.strict();

export const listDrinksSchema = z.object({
	limit: limitSchema,
	page: pageSchema,
	search: stringifiedJSONSchema(searchSchema).optional(),
	sort: stringifiedJSONSchema(sortSchema).optional(),
});
