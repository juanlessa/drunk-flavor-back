import { z } from 'zod/v4';
import { reauthenticatePasswordSchema } from './reauthenticatePassword.schema';

export type ReauthenticatePasswordReqBody = z.infer<typeof reauthenticatePasswordSchema>;

export type ReauthenticatePasswordCommand = {
	userId: string;
	password: string;
};

export type PasswordReauthenticationResult = {
	method: 'password';
	authenticatedAt: Date;
};
