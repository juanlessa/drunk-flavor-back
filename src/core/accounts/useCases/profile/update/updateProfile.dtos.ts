import { z } from 'zod/v4';
import { Role } from '@/shared/accessControl/roles';
import { UserStatus } from '@/core/accounts/entities/user.entity';
import { updateProfileSchema } from './updateProfile.schema';

export type UpdateUserProfileReqBody = z.infer<typeof updateProfileSchema>;

export type UpdateProfile = {
	id: string;
	name: string;
	surname: string;
};

export type UpdateProfileResult = {
	user: {
		id: string;
		role: Role;
		status: UserStatus;
		sessionVersion: number;
	};
};
