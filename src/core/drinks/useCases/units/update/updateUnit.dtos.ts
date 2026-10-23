import { z } from 'zod/v4';
import { updateUnitSchema } from './updateUnit.schema';

export type UpdateUnitReqBody = z.infer<typeof updateUnitSchema>;
