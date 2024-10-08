import { z } from 'zod';
import { resetUserPasswordSchema } from './resetUserPassword.schema';

export type ResetUserPasswordReqBody = z.infer<typeof resetUserPasswordSchema>;

export type ResetUserPassword = {
	email: string;
};
