import { DatabaseCommonInfo } from '@shared/infra/database/mongo/types';
import { ROLES } from '../types/roles';

export type ICreateUser = {
	name: string;
	surname: string;
	email: string;
	password: string;
	role: ROLES;
};

export type IUpdateUserRequest = {
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
	role: ROLES;
}>;

export type IDeleteUser = {
	id: string;
};

export type IUpdateUserRole = {
	user_id: string;
	role: string;
};

export type IUserProfileResponse = DatabaseCommonInfo & {
	name: string;
	surname: string;
	email: string;
	role: string;
};

export type IUserProfileRequest = {
	id: string;
};
