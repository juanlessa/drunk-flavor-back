import { z } from 'zod/v4';
import { updateCategorySchema } from './updateCategory.schema';

export type UpdateCategoryReqBody = z.infer<typeof updateCategorySchema>;
