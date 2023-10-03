import { validateSchema } from '@middlewares/fieldsValidator';
import { IDeleteCategory } from '@modules/drinks/dtos/category.dtos';
import { categoryIdValidation } from '@modules/drinks/validations/categories';
import { z } from 'zod';

const deleteCategorySchema = z.object({
	id: categoryIdValidation
});

export const deleteCategoryValidator = validateSchema<IDeleteCategory>(deleteCategorySchema);
