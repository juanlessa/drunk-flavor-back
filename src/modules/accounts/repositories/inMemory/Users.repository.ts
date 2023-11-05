import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { ICreateUser, IUpdateUser } from '@modules/accounts/dtos/user.dtos';
import { ObjectId } from 'bson';
import { IUser } from '@modules/accounts/entities/user.entity';
import { NotFoundError } from '@shared/errors/error.lib';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';

class UsersRepositoryInMemory implements IUsersRepository {
	users: IUser[] = [];

	async create({ surname, email, name, password, role }: ICreateUser): Promise<IUser> {
		const user: IUser = {
			_id: new ObjectId().toString(),
			surname,
			email,
			name,
			password,
			role,
			created_at: new Date(),
			updated_at: new Date()
		};
		this.users.push(user);
		return user;
	}

	async update({ id, ...data }: IUpdateUser): Promise<IUser> {
		const userIndex = this.users.findIndex((u) => u._id === id);
		if (userIndex === -1) {
			throw new NotFoundError(USER_ERRORS.not_found, {
				path: 'Users.repository',
				cause: 'Error on findOneAndUpdate operation'
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

	async delete(id: string): Promise<IUser> {
		const userIndex = this.users.findIndex((u) => u._id === id);
		if (userIndex === -1) {
			throw new NotFoundError(USER_ERRORS.not_found, {
				path: 'Users.repository',
				cause: 'Error on findOneAndDelete operation'
			});
		}

		const [deletedUser] = this.users.splice(userIndex, 1);
		return deletedUser;
	}

	async findByEmail(email: string): Promise<IUser | null> {
		const foundUser = this.users.find((user) => user.email === email);
		return foundUser || null;
	}

	async findById(id: string): Promise<IUser | null> {
		const foundUser = this.users.find((user) => user._id === id);
		return foundUser || null;
	}

	async findAll(): Promise<IUser[]> {
		const results = [...this.users];
		return results;
	}
}

export { UsersRepositoryInMemory };
