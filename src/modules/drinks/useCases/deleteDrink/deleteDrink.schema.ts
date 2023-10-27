import { validateSchema } from '@shared/infra/http/middlewares/validateSchema';
import { IDeleteDrink } from '@modules/drinks/dtos/drink.dtos';
import { drinkIdValidation } from '@modules/drinks/validations/drink.validations';

import { z } from 'zod';

const deleteDrinkSchema = z.object({
	id: drinkIdValidation
});

export const deleteDrinkValidator = validateSchema<IDeleteDrink>(deleteDrinkSchema);
