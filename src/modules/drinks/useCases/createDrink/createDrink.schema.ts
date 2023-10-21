import { validateSchema } from '@middlewares/validateSchema';
import { ICreateDrinkRequest } from '@modules/drinks/dtos/drink.dtos';
import { drinkIngredientsValidation, drinkTranslationSchema } from '@modules/drinks/validations/drink.validations';
import { getZodTranslationsSchema } from '@modules/drinks/validations/getZodTranslationsSchema';
import { z } from 'zod';

const createDrinkSchema = z.object({
	translations: getZodTranslationsSchema(drinkTranslationSchema),
	ingredients: drinkIngredientsValidation
});

export const createDrinkValidator = validateSchema<ICreateDrinkRequest>(createDrinkSchema);
