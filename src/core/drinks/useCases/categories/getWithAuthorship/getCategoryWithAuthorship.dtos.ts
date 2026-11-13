import { z } from 'zod/v4';
import { getCategorySchema } from '../get/getCategory.schema';

export type GetCategoryWithAuthorshipReqParam = z.infer<typeof getCategorySchema>;

export type GetCategoryWithAuthorshipCommand = {
	id: string;
};
