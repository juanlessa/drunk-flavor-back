import { DeepPartial } from '@/shared/types/utility.types';
import { CreateUser } from '../dtos/user.dtos';
import { Identity, IdentityProviders } from '../entities/identity.entity';
import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';

export const createUserFactory = (user?: DeepPartial<CreateUser>): CreateUser => ({
	name: user?.name || 'John',
	surname: user?.surname || 'Doe',
	email: user?.email || 'johndoe@example.com',
	email_verified: user?.email_verified ?? false,
	avatar_url: user?.avatar_url,
	role: user?.role || 'member',
	status: user?.status || 'active',
});

export const createCredentialFactory = (
	credential?: Partial<{ user_id: string; password_hash: string }>,
): { user_id: string; password_hash: string } => ({
	user_id: credential?.user_id || '000000000000000000000000',
	password_hash: credential?.password_hash || 'hashed-Password-12345678',
});

export const createIdentityFactory = (
	identity?: DeepPartial<Omit<Identity, keyof DatabaseCommonInfo>>,
): Omit<Identity, keyof DatabaseCommonInfo> => ({
	user_id: identity?.user_id || '000000000000000000000000',
	provider: identity?.provider || IdentityProviders.google,
	provider_sub: identity?.provider_sub || 'google-sub-123',
	email: identity?.email || 'johndoe@example.com',
	email_verified: identity?.email_verified ?? true,
	picture: identity?.picture,
	last_login_at: identity?.last_login_at,
});

/**
 * Bundles a password-free user with its plaintext password so tests that need to
 * sign in can create the user + credential pair and still know the plaintext.
 */
export const createUserWithPasswordFactory = (
	user?: DeepPartial<CreateUser> & { password?: string },
): { user: CreateUser; password: string } => ({
	user: createUserFactory(user),
	password: user?.password || 'Password-12345678',
});
