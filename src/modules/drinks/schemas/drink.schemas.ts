import { z } from 'zod';
import { DRINK_MESSAGES } from '@/modules/drinks/constants/drinks.constants';

// Fields validation
export const drinkIdValidation = z
	.string({ required_error: DRINK_MESSAGES.requiredId.message })
	.length(24, { message: DRINK_MESSAGES.invalidIdFormat.message });

export const drinkNameValidation = z
	.string({ required_error: DRINK_MESSAGES.requiredName.message })
	.trim()
	.toLowerCase()
	.min(1, { message: DRINK_MESSAGES.invalidNameFormat.message })
	.transform((val) => `${val.charAt(0).toLocaleUpperCase()}${val.slice(1)}`);

export const drinkMethodValidation = z
	.string({ required_error: DRINK_MESSAGES.requiredMethod.message })
	.trim()
	.min(1, { message: DRINK_MESSAGES.invalidMethodFormat.message });

export const drinkCoverValidation = z
	.string({ required_error: DRINK_MESSAGES.requiredCover.message })
	.min(1, { message: DRINK_MESSAGES.invalidCoverFormat.message });

export const drinkThumbnailValidation = z
	.string({ required_error: DRINK_MESSAGES.requiredThumbnail.message })
	.min(1, { message: DRINK_MESSAGES.invalidThumbnailFormat.message });

export const drinkIngredientsValidation = z
	.array(
		z.object({
			ingredient_id: z
				.string({ required_error: DRINK_MESSAGES.requiredIngredientId.message })
				.length(24, { message: DRINK_MESSAGES.invalidIngredientIdFormat.message }),
			quantity: z
				.number({ required_error: DRINK_MESSAGES.requiredQuantity.message })
				.gt(0, { message: DRINK_MESSAGES.invalidQuantityFormat.message }),
		}),
	)
	.min(1, { message: DRINK_MESSAGES.requiredIngredients.message });

// schemas
export const drinkTranslationSchema = z.object({
	name: drinkNameValidation,
	method: drinkMethodValidation,
});
