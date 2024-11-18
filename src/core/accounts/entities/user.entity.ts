import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';
import { Role } from '@/shared/accessControl/roles';

export enum UserStatusEnum {
	idle = 'idle',
	pending = 'pending',
	active = 'active',
}

export type UserStatus = keyof typeof UserStatusEnum;

export type User = DatabaseCommonInfo & {
	name: string;
	surname: string;
	email: string;
	password: string;
	role: Role;
	status: UserStatus;
};
