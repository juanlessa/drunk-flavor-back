import { z } from 'zod/v4';
import { getUnitSchema } from './getUnit.schema';

export type GetUnitReqParam = z.infer<typeof getUnitSchema>;

export type GetUnitCommand = {
	id: string;
};
