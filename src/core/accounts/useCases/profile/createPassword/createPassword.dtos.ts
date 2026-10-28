import { z } from 'zod/v4';
import { User } from '@/core/accounts/entities/user.entity';
import { createPasswordSchema } from './createPassword.schema';

export type CreatePasswordReqBody = z.infer<typeof createPasswordSchema>;

export type CreatePassword = {
	userId: string;
	password: string;
};

export type CreatePasswordResult = {
	user: Pick<User, 'id' | 'role' | 'status' | 'sessionVersion'>;
};
