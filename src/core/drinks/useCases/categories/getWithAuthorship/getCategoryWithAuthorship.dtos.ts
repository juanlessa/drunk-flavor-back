import { z } from 'zod/v4';
import { getCategorySchema } from '../get/getCategory.schema';

export type GetCategoryWithAuthorshipReqParams = z.infer<typeof getCategorySchema>;
