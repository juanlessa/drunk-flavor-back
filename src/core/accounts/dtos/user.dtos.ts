import { User, UserRole } from '@/core/accounts/entities/user.entity';

export type CreateUser = {
	name: string;
	surname: string;
	email: string;
	password: string;
	role: UserRole;
};

export type UpdateUser = { id: string } & Partial<{
	name: string;
	surname: string;
	email: string;
	password: string;
	role: UserRole;
}>;

export type DeleteUser = {
	id: string;
};

export type UpdateUserRole = {
	user_id: string;
	role: UserRole;
};

export type UserWithoutPassword = Omit<User, 'password'>;
