import { z } from 'zod/v4';
import { User } from '@/core/accounts/entities/user.entity';
import { updatePasswordSchema } from './updatePassword.schema';

export type UpdatePasswordReqBody = z.infer<typeof updatePasswordSchema>;

export type UpdatePassword = {
	id: string;
	currentPassword: string;
	newPassword: string;
};

export type UpdatePasswordResult = {
	user: Pick<User, 'id' | 'role' | 'status' | 'sessionVersion'>;
};
