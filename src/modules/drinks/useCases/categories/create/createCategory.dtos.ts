import { z } from 'zod';
import { createCategorySchema } from './createCategory.schema';

export type CreateCategoryReqBody = z.infer<typeof createCategorySchema>;
