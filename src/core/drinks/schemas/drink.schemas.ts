import { getObjectIdSchema } from '@/infrastructure/mongo/schemas/helpers/objectId.helpers';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod';

// Fields validation
export const drinkIdValidation = getObjectIdSchema({
	required: 'apiResponses.drinks.requiredId',
	invalid: 'apiResponses.drinks.invalidIdFormat',
});

export const drinkNameValidation = z
	.string({ required_error: 'apiResponses.drinks.requiredName' satisfies LocaleKey })
	.trim()
	.toLowerCase()
	.min(1, { message: 'apiResponses.drinks.invalidNameFormat' satisfies LocaleKey })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const drinkMethodValidation = z
	.string({ required_error: 'apiResponses.drinks.requiredMethod' satisfies LocaleKey })
	.trim()
	.min(1, { message: 'apiResponses.drinks.invalidMethodFormat' satisfies LocaleKey });

export const drinkCoverValidation = z
	.string({ required_error: 'apiResponses.drinks.requiredCover' satisfies LocaleKey })
	.min(1, { message: 'apiResponses.drinks.invalidCoverFormat' satisfies LocaleKey });

export const drinkThumbnailValidation = z
	.string({ required_error: 'apiResponses.drinks.requiredThumbnail' satisfies LocaleKey })
	.min(1, { message: 'apiResponses.drinks.invalidThumbnailFormat' satisfies LocaleKey });

export const drinkIngredientsValidation = z
	.array(
		z.object({
			ingredient_id: getObjectIdSchema({
				required: 'apiResponses.drinks.requiredIngredientId',
				invalid: 'apiResponses.drinks.invalidIngredientIdFormat',
			}),
			quantity: z
				.number({ required_error: 'apiResponses.drinks.requiredQuantity' satisfies LocaleKey })
				.gt(0, { message: 'apiResponses.drinks.invalidQuantityFormat' satisfies LocaleKey }),
		}),
	)
	.min(1, { message: 'apiResponses.drinks.requiredIngredients' satisfies LocaleKey });

// schemas
export const drinkTranslationSchema = z.object({
	name: drinkNameValidation,
	method: drinkMethodValidation,
});
