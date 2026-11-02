import { z } from 'zod/v4';
import { reauthenticatePasswordSchema } from './reauthenticatePassword.schema';

export type ReauthenticatePasswordReqBody = z.infer<typeof reauthenticatePasswordSchema>;

export type ReauthenticatePassword = {
	userId: string;
	password: string;
};

export type PasswordReauthenticationResult = {
	method: 'password';
	authenticatedAt: Date;
};
