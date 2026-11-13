import { IdentityProvider } from '@/core/accounts/entities/identity.entity';
import { UserView } from '@/core/accounts/mappers/user.mappers';

export type GetProfileCommand = {
	id: string;
};

/**
 * `password.removable` and `disconnectableProviders` tell the client which sign-in methods the user can remove right
 * now. An account must keep at least one way to sign in, so the password is removable only while a provider is
 * connected, and providers are disconnectable only while a password exists.
 */
export type ProfileAuthenticationMethods = {
	password: {
		enabled: boolean;
		removable: boolean;
	};
	providers: IdentityProvider[];
	disconnectableProviders: IdentityProvider[];
};

export type ProfileView = UserView & {
	authenticationMethods: ProfileAuthenticationMethods;
};
