import { z } from 'zod/v4';
import { getUnitSchema } from '../get/getUnit.schema';

export type GetUnitWithAuthorshipReqParams = z.infer<typeof getUnitSchema>;
