import { UserStatus } from '@/core/accounts/entities/user.entity';

export type AuthSessionData = {
	refreshToken: string;
	userId: string;
	userRole: string;
	userStatus: UserStatus;
};
