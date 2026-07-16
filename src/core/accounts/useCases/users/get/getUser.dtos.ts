import { z } from 'zod/v4';
import { getUserSchema } from './getUser.schema';

export type GetUserSchemaReqParams = z.infer<typeof getUserSchema>;

export type GetUser = {
	id: string;
};
