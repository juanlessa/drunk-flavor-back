import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';

export enum UserRolesEnum {
	admin = 'admin',
	partner = 'partner',
	member = 'member',
}

export enum UserStatusEnum {
	idle = 'idle',
	pending = 'pending',
	active = 'active',
}

export type UserRole = keyof typeof UserRolesEnum;
export type UserStatus = keyof typeof UserStatusEnum;

export type User = DatabaseCommonInfo & {
	name: string;
	surname: string;
	email: string;
	password: string;
	role: UserRole;
	status: UserStatus;
};
