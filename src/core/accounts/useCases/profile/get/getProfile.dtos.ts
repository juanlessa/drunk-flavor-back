import { IdentityProvider } from '@/core/accounts/entities/identity.entity';
import { User } from '@/core/accounts/entities/user.entity';

export type GetProfile = {
	id: string;
};

export type ProfileAuthenticationMethods = {
	password: {
		enabled: boolean;
	};
	providers: IdentityProvider[];
};

export type ProfileView = User & {
	authentication_methods: ProfileAuthenticationMethods;
};
