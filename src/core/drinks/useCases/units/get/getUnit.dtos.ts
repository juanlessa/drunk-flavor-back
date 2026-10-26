import { z } from 'zod/v4';
import { getUnitSchema } from './getUnit.schema';

export type GetUnitReqParams = z.infer<typeof getUnitSchema>;
