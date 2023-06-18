import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { ICreateUser, IUpdateUser } from '@modules/accounts/dtos/Users';
import { ObjectId } from 'bson';

import User from '@modules/accounts/entities/User';

class UsersRepositoryInMemory implements IUsersRepository {
	users: User[] = [];

	async create({ surname, email, name, password }: ICreateUser): Promise<User> {
		const user: User = {
			id: new ObjectId().toString(),
			surname,
			email,
			name,
			password,
			created_at: new Date()
		};

		this.users.push(user);
		return user;
	}
	async update({ id, surname, email, name, password }: IUpdateUser): Promise<User> {
		let user: User;

		this.users = this.users.map((u) => {
			if (u.id === id) {
				user = {
					id: u.id,
					name,
					surname,
					email,
					password,
					created_at: u.created_at
				};
				return user;
			}
			return u;
		});

		return user;
	}

	async findByEmail(email: string): Promise<User> {
		return this.users.find((user) => user.email === email);
	}

	async findById(id: string): Promise<User> {
		return this.users.find((user) => user.id === id);
	}
}

export { UsersRepositoryInMemory };
