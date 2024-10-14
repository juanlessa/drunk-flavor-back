import { QueryParams } from '@/shared/types/query.types';
import { listCategoriesQuerySchema } from './listCategories.schema';
import { z } from 'zod';

export type ListCategoriesReqQuery = z.infer<typeof listCategoriesQuerySchema>;

export type ListCategoriesDTO = {
	query?: QueryParams;
};
