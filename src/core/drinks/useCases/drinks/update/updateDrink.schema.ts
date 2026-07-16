import {
	drinkIdValidation,
	drinkIngredientsValidation,
	drinkTranslationSchema,
} from '@/core/drinks/schemas/drink.schemas';
import { generateTranslationsSchema } from '@/core/drinks/schemas/helpers/translations.helpers';
import { z } from 'zod/v4';

export const updateDrinkSchema = z.object({
	id: drinkIdValidation,
	translations: generateTranslationsSchema(drinkTranslationSchema),
	ingredients: drinkIngredientsValidation,
});
