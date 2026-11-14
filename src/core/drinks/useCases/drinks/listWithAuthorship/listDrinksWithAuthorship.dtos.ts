import { Actor } from '@/shared/accessControl/actor.types';
import { QueryParams } from '@/shared/types/query.types';
import { z } from 'zod/v4';
import { listDrinksSchema } from '../list/listDrinks.schema';

export type ListDrinksWithAuthorshipReqQuery = z.infer<typeof listDrinksSchema>;
export type ListDrinksWithAuthorshipCommand = { query?: QueryParams; actor: Actor };
