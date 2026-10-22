import { User, UserStatus } from '@/core/accounts/entities/user.entity';
import { Actor } from '@/shared/accessControl/actor.types';
import { Role } from '@/shared/accessControl/roles';

export type CreateUser = {
	name: string;
	surname: string;
	email: string;
	password: string;
	role: Role;
	status: UserStatus;
};

export type UpdateUser = { id: string } & Partial<{
	name: string;
	surname: string;
	email: string;
	password: string;
	role: Role;
	status: UserStatus;
}>;

export type UpdateUserRole = {
	user_id: string;
	role: Role;
	actor: Actor;
};

export type UserWithoutPassword = Omit<User, 'password'>;
