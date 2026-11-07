import { preparationPlanValidation } from '@/core/drinks/modules/preparation';
import {
	drinkGarnishesValidation,
	drinkIdValidation,
	drinkIngredientsValidation,
	drinkTranslationInputSchema,
	requireMethodOrPreparation,
} from '@/core/drinks/schemas/drink.schemas';
import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import { z } from 'zod/v4';

export const updateDrinkSchema = z
	.object({
		id: drinkIdValidation,
		translations: generateTranslationsSchema(drinkTranslationInputSchema),
		ingredients: drinkIngredientsValidation,
		garnishes: drinkGarnishesValidation,
		preparation: preparationPlanValidation.optional(),
	})
	.superRefine(requireMethodOrPreparation);
