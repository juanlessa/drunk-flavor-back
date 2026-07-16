import { z } from 'zod/v4';
import { getCategorySchema } from './getCategory.schema';

export type GetCategoryReqParams = z.infer<typeof getCategorySchema>;
