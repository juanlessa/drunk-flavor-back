import { z } from 'zod/v4';
import { reauthenticateGoogleSchema } from './reauthenticateGoogle.schema';

export type ReauthenticateGoogleReqBody = z.infer<typeof reauthenticateGoogleSchema>;

export type ReauthenticateGoogle = {
	userId: string;
	authorizationCode: string;
};

export type GoogleReauthenticationResult = {
	method: 'google';
	authenticatedAt: Date;
};
