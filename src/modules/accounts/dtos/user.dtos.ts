import { UserRole } from '@/modules/accounts/entities/user.entity';
import { DatabaseCommonInfo } from '@/shared/infra/mongo/types';

export type ICreateUser = {
	name: string;
	surname: string;
	email: string;
	password: string;
	role: UserRole;
};

export type IUpdateUserRequest = {
	name: string;
	surname: string;
	email: string;
	password: string;
};

export type IUpdateUserDto = {
	id: string;
	name: string;
	surname: string;
	email: string;
	password: string;
};

export type IUpdateUser = { id: string } & Partial<{
	name: string;
	surname: string;
	email: string;
	password: string;
	role: UserRole;
}>;

export type IDeleteUser = {
	id: string;
};

export type IUpdateUserRole = {
	user_id: string;
	role: UserRole;
};

export type IUserProfileResponse = DatabaseCommonInfo & {
	name: string;
	surname: string;
	email: string;
	role: UserRole;
};

export type IUserProfileRequest = {
	id: string;
};
