import { z } from 'zod/v4';
import { linkGoogleIdentitySchema } from './linkGoogleIdentity.schema';

export type LinkGoogleIdentityReqBody = z.infer<typeof linkGoogleIdentitySchema>;

export type LinkGoogleIdentity = {
	userId: string;
	currentPassword: string;
	idToken: string;
};
