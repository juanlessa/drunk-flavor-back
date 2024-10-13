import { User, UserRole, UserStatus } from '@/core/accounts/entities/user.entity';

export type CreateUser = {
	name: string;
	surname: string;
	email: string;
	password: string;
	role: UserRole;
	status: UserStatus;
};

export type UpdateUser = { id: string } & Partial<{
	name: string;
	surname: string;
	email: string;
	password: string;
	role: UserRole;
	status: UserStatus;
}>;

export type UserWithoutPassword = Omit<User, 'password'>;
