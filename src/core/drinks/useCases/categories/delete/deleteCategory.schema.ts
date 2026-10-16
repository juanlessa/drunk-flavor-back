import { categoryIdValidation } from '@/core/drinks/schemas/category.schemas';
import { z } from 'zod/v4';

export const deleteCategorySchema = z.object({
	id: categoryIdValidation,
});
