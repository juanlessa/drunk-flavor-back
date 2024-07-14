import { z } from 'zod';
import { getCategorySchema } from './getCategory.schema';

export type GetCategoryReqParams = z.infer<typeof getCategorySchema>;
