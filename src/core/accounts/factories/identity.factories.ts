import { DeepPartial } from '@/shared/types/utility.types';
import { CreateIdentity } from '../dtos/identity.dtos';
import { IdentityProviders } from '../constants/identity.constants';

export const createIdentityFactory = (identity?: DeepPartial<CreateIdentity>): CreateIdentity => ({
	userId: identity?.userId || '000000000000000000000000',
	provider: identity?.provider || IdentityProviders.google,
	providerSubject: identity?.providerSubject || 'google-sub-123',
	email: identity?.email || 'johndoe@example.com',
	isEmailVerified: identity?.isEmailVerified ?? true,
	pictureUrl: identity?.pictureUrl,
	lastLoginAt: identity?.lastLoginAt,
});
