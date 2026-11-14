import { Actor } from '@/shared/accessControl/actor.types';
import { QueryParams } from '@/shared/types/query.types';
import { z } from 'zod/v4';
import { listCategoriesQuerySchema } from '../list/listCategories.schema';

export type ListCategoriesWithAuthorshipReqQuery = z.infer<typeof listCategoriesQuerySchema>;
export type ListCategoriesWithAuthorshipCommand = { query?: QueryParams; actor: Actor };
