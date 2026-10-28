import { UserStatus } from '@/core/accounts/entities/user.entity';
import { Role } from '@/shared/accessControl/roles';
import { IdentityProvider } from '@/core/accounts/entities/identity.entity';

export type AuthenticationMethod = 'password' | IdentityProvider;

export type AuthSessionData = {
	refreshToken: string;
	userId: string;
	userRole: Role;
	userStatus: UserStatus;
	sessionVersion: number;
	authenticatedAt?: string;
	authenticationMethod?: AuthenticationMethod;
	reauthenticatedAt?: string;
	reauthenticationMethod?: AuthenticationMethod;
};
