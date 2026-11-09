import { z } from 'zod/v4';
import { DeleteCategory } from '@/core/drinks/dtos/category.dtos';
import { Actor } from '@/shared/accessControl/actor.types';
import { deleteCategorySchema } from './deleteCategory.schema';

export type DeleteCategoryReqBody = z.infer<typeof deleteCategorySchema>;
export type DeleteCategoryDTO = DeleteCategory & { actor: Actor };
