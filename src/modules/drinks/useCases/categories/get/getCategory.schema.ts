import { categoryIdValidation } from '@/modules/drinks/schemas/category.schemas';
import { z } from 'zod';

export const getCategorySchema = z.object({
	id: categoryIdValidation,
});
