import { DrinkMatchMaxMissing, MAX_DRINK_MATCH_INGREDIENTS } from '@/core/drinks/constants/drink.constants';
import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
import { limitSchema, pageSchema } from '@/shared/schemas/query.schemas';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';

const ingredientIdValidation = getObjectIdSchema({
	required: 'apiResponses.drinks.requiredIngredientId',
	invalid: 'apiResponses.drinks.invalidIngredientIdFormat',
});

/** What is being searched for, sent as the content of the QUERY request. */
export const matchDrinksSchema = z.object({
	// The ingredients a person has. Listing one twice changes nothing, so repeats are dropped.
	ingredientIds: z
		.array(ingredientIdValidation, { error: 'apiResponses.drinks.requiredMatchIngredients' satisfies LocaleKey })
		.min(1, { error: 'apiResponses.drinks.requiredMatchIngredients' satisfies LocaleKey })
		.max(MAX_DRINK_MATCH_INGREDIENTS, { error: 'apiResponses.drinks.tooManyMatchIngredients' satisfies LocaleKey })
		.transform((ids) => [...new Set(ids)]),
	// 0 to 2 required ingredients may be missing, or `any` number of them. Defaults to none.
	maxMissing: z
		.literal([...DrinkMatchMaxMissing], { error: 'apiResponses.drinks.invalidMaxMissing' satisfies LocaleKey })
		.default(0),
});

/** The page asked for, in the URL like in every other listing. */
export const matchDrinksQuerySchema = z.object({
	limit: limitSchema,
	page: pageSchema,
});
