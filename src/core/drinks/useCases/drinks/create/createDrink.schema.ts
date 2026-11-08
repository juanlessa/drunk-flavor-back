import { preparationPlanValidation } from '@/core/drinks/modules/preparation';
import {
	drinkGarnishesValidation,
	drinkIngredientsValidation,
	drinkTranslationInputSchema,
	requireMethodOrPreparation,
} from '@/core/drinks/schemas/drink.schemas';
import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import { z } from 'zod/v4';

export const createDrinkSchema = z
	.object({
		translations: generateTranslationsSchema(drinkTranslationInputSchema),
		ingredients: drinkIngredientsValidation,
		garnishes: drinkGarnishesValidation.default([]),
		preparation: preparationPlanValidation.optional(),
	})
	.superRefine(requireMethodOrPreparation);
