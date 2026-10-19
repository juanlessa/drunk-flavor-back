import { z } from 'zod/v4';
import { updatePasswordSchema } from './updatePassword.schema';

export type UpdatePasswordReqBody = z.infer<typeof updatePasswordSchema>;

export type UpdatePassword = {
	id: string;
	currentPassword: string;
	newPassword: string;
};
