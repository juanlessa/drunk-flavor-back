import { QueryParams } from '@/shared/types/query.types';
import { listUsersQuerySchema } from './listUsers.schema';
import { z } from 'zod/v4';

export type ListUsersReqQuery = z.infer<typeof listUsersQuerySchema>;

export type ListUsers = {
	query?: QueryParams;
};
