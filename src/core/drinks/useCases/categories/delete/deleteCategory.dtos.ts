import { z } from 'zod/v4';
import { Actor } from '@/shared/accessControl/actor.types';
import { deleteCategorySchema } from './deleteCategory.schema';

export type DeleteCategoryReqBody = z.infer<typeof deleteCategorySchema>;
export type DeleteCategoryCommand = {
	id: string;
	actor: Actor;
};
