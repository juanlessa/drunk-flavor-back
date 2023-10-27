import { validateSchema } from '@shared/infra/http/middlewares/validateSchema';
import { IDeleteCategory } from '@modules/drinks/dtos/category.dtos';
import { categoryIdValidation } from '@modules/drinks/validations/category.validations';
import { z } from 'zod';

const deleteCategorySchema = z.object({
	id: categoryIdValidation
});

export const deleteCategoryValidator = validateSchema<IDeleteCategory>(deleteCategorySchema);
