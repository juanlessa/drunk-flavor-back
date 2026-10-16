import { z } from 'zod/v4';
import { categoryIdValidation } from '@/core/drinks/schemas/category.schemas';

export const getCategorySchema = z.object({
	id: categoryIdValidation,
});
