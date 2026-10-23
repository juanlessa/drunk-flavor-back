import { QueryParams } from '@/shared/types/query.types';
import { listUsersQuerySchema } from './listUsers.schema';
import { z } from 'zod/v4';
import { Actor } from '@/shared/accessControl/actor.types';

export type ListUsersReqQuery = z.infer<typeof listUsersQuerySchema>;

export type ListUsers = {
	query?: QueryParams;
	actor: Actor;
};
