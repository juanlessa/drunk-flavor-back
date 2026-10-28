import { UserStatus } from '@/core/accounts/entities/user.entity';
import { Role } from '@/shared/accessControl/roles';

export type CreateUser = {
	name?: string;
	surname?: string;
	email: string;
	emailVerified?: boolean;
	avatarUrl?: string;
	role: Role;
	status: UserStatus;
	sessionVersion?: number;
};

export type UpdateUser = { id: string } & Partial<{
	name: string;
	surname: string;
	email: string;
	emailVerified: boolean;
	avatarUrl: string;
	role: Role;
	status: UserStatus;
	sessionVersion: number;
}>;
