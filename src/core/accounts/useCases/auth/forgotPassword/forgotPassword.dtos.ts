import { z } from 'zod';
import { forgotPasswordSchema } from './forgotPassword.schema';

export type ForgotPasswordReqBody = z.infer<typeof forgotPasswordSchema>;

export type ForgotPassword = {
	email: string;
};
