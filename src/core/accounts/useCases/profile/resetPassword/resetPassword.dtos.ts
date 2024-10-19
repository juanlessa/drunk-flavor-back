import { z } from 'zod';
import { resetPasswordSchema } from './resetPassword.schema';

export type ResetPasswordReqBody = z.infer<typeof resetPasswordSchema>;

export type ResetPassword = {
	token: string;
	password: string;
};
