import { z } from 'zod';
import { deleteCategorySchema } from './deleteCategory.schema';

export type DeleteCategoryReqBody = z.infer<typeof deleteCategorySchema>;
