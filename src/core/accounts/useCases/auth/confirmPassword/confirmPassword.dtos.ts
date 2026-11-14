import { z } from 'zod/v4';
import { confirmPasswordSchema } from './confirmPassword.schema';

export type ConfirmPasswordReqBody = z.infer<typeof confirmPasswordSchema>;

export type ConfirmPasswordCommand = {
	token: string;
	password: string;
};
