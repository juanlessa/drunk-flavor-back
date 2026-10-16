import { z } from 'zod/v4';
import { deleteCategorySchema } from './deleteCategory.schema';

export type DeleteCategoryReqBody = z.infer<typeof deleteCategorySchema>;
