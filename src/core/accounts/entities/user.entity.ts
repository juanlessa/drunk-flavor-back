import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';
import { Role } from '@/shared/accessControl/roles';

export const UserStatuses = {
	idle: 'idle',
	pending: 'pending',
	active: 'active',
} as const;

export type UserStatus = (typeof UserStatuses)[keyof typeof UserStatuses];

export type User = DatabaseCommonInfo & {
	name: string;
	surname: string;
	email: string;
	email_verified: boolean;
	avatar_url?: string;
	role: Role;
	status: UserStatus;
};
