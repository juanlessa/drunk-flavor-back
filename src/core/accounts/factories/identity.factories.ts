import { DeepPartial } from '@/shared/types/utility.types';
import { CreateIdentity } from '../dtos/identity.dtos';
import { IdentityProviders } from '../constants/identity.constants';

export const createIdentityFactory = (identity?: DeepPartial<CreateIdentity>): CreateIdentity => ({
	user_id: identity?.user_id || '000000000000000000000000',
	provider: identity?.provider || IdentityProviders.google,
	provider_sub: identity?.provider_sub || 'google-sub-123',
	email: identity?.email || 'johndoe@example.com',
	email_verified: identity?.email_verified ?? true,
	picture: identity?.picture,
	last_login_at: identity?.last_login_at,
});
