import { validateSchema } from '@middlewares/fieldsValidator';
import { IDeleteDrink } from '@modules/drinks/dtos/drink.dtos';
import { drinkIdValidation } from '@modules/drinks/validations/drinks';

import { z } from 'zod';

const deleteDrinkSchema = z.object({
	id: drinkIdValidation
});

export const deleteDrinkValidator = validateSchema<IDeleteDrink>(deleteDrinkSchema);
