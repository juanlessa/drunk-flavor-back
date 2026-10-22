import { z } from 'zod/v4';
import { createUserSchema } from './createUser.schema';
import { Role } from '@/shared/accessControl/roles';
import { Actor } from '@/shared/accessControl/actor.types';

export type CreateUserReqBody = z.infer<typeof createUserSchema>;

export type CreateUserDTO = {
	name: string;
	surname: string;
	email: string;
	password: string;
	role: Role;
	actor: Actor;
};
