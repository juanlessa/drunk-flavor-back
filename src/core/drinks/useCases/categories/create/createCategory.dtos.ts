import { z } from 'zod/v4';
import { CategoryData } from '@/core/drinks/dtos/category.dtos';
import { Actor } from '@/shared/accessControl/actor.types';
import { createCategorySchema } from './createCategory.schema';

export type CreateCategoryReqBody = z.infer<typeof createCategorySchema>;
export type CreateCategoryCommand = CategoryData & { actor: Actor };
