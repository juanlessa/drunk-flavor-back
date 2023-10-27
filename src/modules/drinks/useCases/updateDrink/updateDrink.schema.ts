import { validateSchema } from '@middlewares/validateSchema';
import { IUpdateDrinkRequest } from '@modules/drinks/dtos/drink.dtos';
import {
	drinkIdValidation,
	drinkIngredientsValidation,
	drinkTranslationSchema
} from '@modules/drinks/validations/drink.validations';
import { getZodTranslationsSchema } from '@modules/drinks/validations/utils/getZodTranslationsSchema';
import { z } from 'zod';

const updateDrinkSchema = z.object({
	id: drinkIdValidation,
	translations: getZodTranslationsSchema(drinkTranslationSchema),
	ingredients: drinkIngredientsValidation
});

export const updateDrinkValidator = validateSchema<IUpdateDrinkRequest>(updateDrinkSchema);
