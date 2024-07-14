import { QueryParams } from '@/shared/types/query.types';
import { listCategoryQuerySchema } from './listCategories.schema';
import { z } from 'zod';

export type ListCategoriesReqQuery = z.infer<typeof listCategoryQuerySchema>;

export type ListCategoriesDTO = {
	query?: QueryParams;
};
