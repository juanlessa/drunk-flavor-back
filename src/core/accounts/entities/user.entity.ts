import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';
import { Role } from '@/shared/accessControl/roles';
import { UserStatuses } from '../constants/user.constants';

export type UserStatus = (typeof UserStatuses)[keyof typeof UserStatuses];

type UserBase = DatabaseCommonInfo & {
	email: string;
	email_verified: boolean;
	avatar_url?: string;
	role: Role;
};

export type IncompleteProfileUser = UserBase & {
	status: typeof UserStatuses.incomplete_profile;
	name?: string;
	surname?: string;
};

export type CompleteUser = UserBase & {
	status: Exclude<UserStatus, typeof UserStatuses.incomplete_profile>;
	name: string;
	surname: string;
};

/**
 * User =
 *     _id: ObjectId
 *     name: string (optional only when status == "incomplete_profile")
 *     surname: string (optional only when status == "incomplete_profile")
 *     status: UserStatus ("idle" | "pending" | "active" | "incomplete_profile")
 *     email: string
 *     email_verified: boolean
 *     avatar_url?: string
 *     role: Role ("admin" | "partner" | "member")
 *     created_at: Date
 *     updated_at: Date
 */
export type User = IncompleteProfileUser | CompleteUser;
