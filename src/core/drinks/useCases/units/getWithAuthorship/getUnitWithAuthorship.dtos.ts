import { z } from 'zod/v4';
import { getUnitSchema } from '../get/getUnit.schema';

export type GetUnitWithAuthorshipReqParam = z.infer<typeof getUnitSchema>;

export type GetUnitWithAuthorshipCommand = {
	id: string;
};
