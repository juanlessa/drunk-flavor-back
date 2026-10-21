import { z } from 'zod/v4';
import { deleteUnitSchema } from './deleteUnit.schema';

export type DeleteUnitReqBody = z.infer<typeof deleteUnitSchema>;
