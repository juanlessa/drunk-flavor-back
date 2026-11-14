import { Actor } from '@/shared/accessControl/actor.types';
import { QueryParams } from '@/shared/types/query.types';
import { z } from 'zod/v4';
import { listIngredientsQuerySchema } from '../list/listIngredients.schema';

export type ListIngredientsWithAuthorshipReqQuery = z.infer<typeof listIngredientsQuerySchema>;
export type ListIngredientsWithAuthorshipCommand = { query?: QueryParams; actor: Actor };
