import { z } from 'zod/v4';
import { confirmPasswordSchema } from './confirmPassword.schema';

export type ConfirmPasswordReqBody = z.infer<typeof confirmPasswordSchema>;

export type ConfirmPassword = {
	token: string;
	password: string;
};
