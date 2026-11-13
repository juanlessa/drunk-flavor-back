import { z } from 'zod/v4';
import { getCategorySchema } from './getCategory.schema';

export type GetCategoryReqParam = z.infer<typeof getCategorySchema>;

export type GetCategoryCommand = {
	id: string;
};
