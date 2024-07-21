import { QueryParams } from '@/shared/types/query.types';
import { listIngredientsSchema } from './listIngredients.schema';
import { z } from 'zod';

export type ListIngredientsReqQuery = z.infer<typeof listIngredientsSchema>;

export type ListIngredientsDTO = {
	query?: QueryParams;
};
