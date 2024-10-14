import { z } from 'zod';
import { createUserSchema } from './createUser.schema';
import { UserRole } from '../../entities/user.entity';

export type CreateUserReqBody = z.infer<typeof createUserSchema>;

export type CreateUserDTO = {
	name: string;
	surname: string;
	email: string;
	password: string;
	role: UserRole;
};
