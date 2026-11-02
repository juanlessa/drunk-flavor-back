import { IdentityProvider } from '@/core/accounts/entities/identity.entity';
import { UserView } from '@/core/accounts/mappers/user.mappers';

export type GetProfile = {
	id: string;
};

export type ProfileAuthenticationMethods = {
	password: {
		enabled: boolean;
	};
	providers: IdentityProvider[];
};

export type ProfileView = UserView & {
	authenticationMethods: ProfileAuthenticationMethods;
};
