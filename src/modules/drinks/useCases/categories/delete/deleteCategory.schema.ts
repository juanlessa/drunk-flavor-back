import { categoryIdValidation } from '@/modules/drinks/schemas/category.schemas';
import { z } from 'zod';

export const deleteCategorySchema = z.object({
	id: categoryIdValidation,
});
