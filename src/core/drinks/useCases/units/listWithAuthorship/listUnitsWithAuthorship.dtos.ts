import { Actor } from '@/shared/accessControl/actor.types';
import { QueryParams } from '@/shared/types/query.types';
import { z } from 'zod/v4';
import { listUnitsQuerySchema } from '../list/listUnits.schema';

export type ListUnitsWithAuthorshipReqQuery = z.infer<typeof listUnitsQuerySchema>;
export type ListUnitsWithAuthorshipDTO = { query?: QueryParams; actor: Actor };
