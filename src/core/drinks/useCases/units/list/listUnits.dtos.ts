import { QueryParams } from '@/shared/types/query.types';
import { z } from 'zod/v4';
import { listUnitsQuerySchema } from './listUnits.schema';

export type ListUnitsReqQuery = z.infer<typeof listUnitsQuerySchema>;
export type ListUnitsDTO = { query?: QueryParams };
