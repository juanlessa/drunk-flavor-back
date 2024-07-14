import { z } from 'zod';
import { categoryIdValidation } from '@/core/drinks/schemas/category.schemas';

export const getCategorySchema = z.object({
	id: categoryIdValidation,
});
