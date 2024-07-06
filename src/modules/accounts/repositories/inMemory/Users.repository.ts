import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';
import { CreateUser, UpdateUser, UserWithoutPassword } from '@/modules/accounts/dtos/user.dtos';
import { ObjectId } from 'mongodb';
import { User } from '@/modules/accounts/entities/user.entity';
import { NotFoundError } from '@/shared/error/error.lib';
import { USER_MESSAGES } from '@/shared/constants/ResponseMessages';
import { omitUserPassword } from '../../mappers/user.mappers';

export class UsersRepositoryInMemory implements IUsersRepository {
	users: User[] = [];

	async create({ surname, email, name, password, role }: CreateUser): Promise<User> {
		const user: User = {
			_id: new ObjectId(),
			surname,
			email,
			name,
			password,
			role,
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.users.push(user);
		return user;
	}

	async update({ id, ...data }: UpdateUser): Promise<User> {
		const userIndex = this.users.findIndex((u) => u._id.toString() === id);
		if (userIndex === -1) {
			throw new NotFoundError(USER_MESSAGES.notFound.message, {
				path: 'Users.repository.update',
				cause: 'Error on findOneAndUpdate operation',
			});
		}

		const user = this.users[userIndex];
		user.name = data.name ?? user.name;
		user.surname = data.surname ?? user.surname;
		user.email = data.email ?? user.email;
		user.password = data.password ?? user.password;
		user.role = data.role ?? user.role;
		user.updated_at = new Date();

		this.users[userIndex] = user;
		return user;
	}

	async delete(id: string): Promise<User> {
		const userIndex = this.users.findIndex((u) => u._id.toString() === id);
		if (userIndex === -1) {
			throw new NotFoundError(USER_MESSAGES.notFound.message, {
				path: 'Users.repository.delete',
				cause: 'Error on findOneAndDelete operation',
			});
		}

		const [deletedUser] = this.users.splice(userIndex, 1);
		return deletedUser;
	}

	async findByEmail(email: string): Promise<User | null> {
		const foundUser = this.users.find((user) => user.email === email);
		return foundUser || null;
	}

	async findById(id: string): Promise<User | null> {
		const foundUser = this.users.find((user) => user._id.toString() === id);
		return foundUser || null;
	}

	async findAll(): Promise<UserWithoutPassword[]> {
		const results = [...this.users];
		return results.map(omitUserPassword);
	}
}
