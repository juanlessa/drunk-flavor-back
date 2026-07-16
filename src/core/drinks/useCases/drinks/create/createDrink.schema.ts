import { drinkIngredientsValidation, drinkTranslationSchema } from '@/core/drinks/schemas/drink.schemas';
import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import { z } from 'zod/v4';

export const createDrinkSchema = z.object({
	translations: generateTranslationsSchema(drinkTranslationSchema),
	ingredients: drinkIngredientsValidation,
});
