import { Actor } from '@/shared/accessControl/actor.types';
import { QueryParams } from '@/shared/types/query.types';
import { z } from 'zod/v4';
import { listIngredientsSchema } from '../list/listIngredients.schema';

export type ListIngredientsWithAuthorshipReqQuery = z.infer<typeof listIngredientsSchema>;
export type ListIngredientsWithAuthorshipDTO = { query?: QueryParams; actor: Actor };
