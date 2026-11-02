import { z } from 'zod/v4';
import { User } from '@/core/accounts/entities/user.entity';
import { linkGoogleIdentitySchema } from './linkGoogleIdentity.schema';

export type LinkGoogleIdentityReqBody = z.infer<typeof linkGoogleIdentitySchema>;

export type LinkGoogleIdentity = {
	userId: string;
	idToken: string;
};

export type LinkGoogleIdentityResult = {
	user: Pick<User, 'id' | 'role' | 'status' | 'sessionVersion'>;
};
