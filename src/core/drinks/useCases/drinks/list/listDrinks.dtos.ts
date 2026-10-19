import { QueryParams } from '@/shared/types/query.types';
import { listDrinksSchema } from './listDrinks.schema';
import { z } from 'zod/v4';

export type ListDrinksReqQuery = z.infer<typeof listDrinksSchema>;

export type ListDrinksDTO = {
	query?: QueryParams;
};
