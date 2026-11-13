import { User } from '@/core/accounts/entities/user.entity';

export type UnlinkGoogleIdentityCommand = {
	userId: string;
};

export type UnlinkGoogleIdentityResult = {
	user: Pick<User, 'id' | 'role' | 'status' | 'sessionVersion'>;
};
