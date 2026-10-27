import { UserStatus } from '@/core/accounts/entities/user.entity';
import { IdentityProvider } from '@/core/accounts/entities/identity.entity';

export type AuthenticationMethod = 'password' | IdentityProvider;

export type AuthSessionData = {
	refreshToken: string;
	userId: string;
	userRole: string;
	userStatus: UserStatus;
	authenticatedAt?: string;
	authenticationMethod?: AuthenticationMethod;
	reauthenticatedAt?: string;
	reauthenticationMethod?: AuthenticationMethod;
};
