import { preparationPlanValidation } from '@/core/drinks/modules/preparation';
import { drinkGarnishesValidation, drinkIngredientsValidation } from '@/core/drinks/schemas/drink.schemas';
import { z } from 'zod/v4';

/** The recipe lines of a drink, like the create request, and the plan to write its method from. */
export const generateMethodSchema = z.object({
	ingredients: drinkIngredientsValidation,
	garnishes: drinkGarnishesValidation.default([]),
	preparation: preparationPlanValidation,
});
