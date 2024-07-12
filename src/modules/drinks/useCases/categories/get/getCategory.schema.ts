import { z } from 'zod';
import { categoryIdValidation } from '@/modules/drinks/schemas/category.schemas';

export const getCategorySchema = z.object({
	id: categoryIdValidation,
});
