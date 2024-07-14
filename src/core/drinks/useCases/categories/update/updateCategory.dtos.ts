import { z } from 'zod';
import { updateCategorySchema } from './updateCategory.schema';

export type UpdateCategoryReqBody = z.infer<typeof updateCategorySchema>;
