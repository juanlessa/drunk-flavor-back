import { CreateUser, UpdateUser, UserWithoutPassword } from '@/core/accounts/dtos/user.dtos';
import { User } from '@/core/accounts/entities/user.entity';

export interface IUsersRepository {
	create(data: CreateUser): Promise<User>;
	update(data: UpdateUser): Promise<User>;
	delete(id: string): Promise<User>;
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	findAll(): Promise<UserWithoutPassword[]>;
}
