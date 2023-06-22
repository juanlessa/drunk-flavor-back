import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { ICreateUser, IUpdateUser } from '@modules/accounts/dtos/Users';
import { ObjectId } from 'bson';

import User from '@modules/accounts/entities/User';

class UsersRepositoryInMemory implements IUsersRepository {
	users: User[] = [];

	async create({ surname, email, name, password, role }: ICreateUser): Promise<User> {
		const user: User = {
			id: new ObjectId().toString(),
			surname,
			email,
			name,
			password,
			role,
			created_at: new Date()
		};

		this.users.push(user);
		return user;
	}
	async update({ id, surname, email, name, password, role }: IUpdateUser): Promise<User> {
		let user: User;

		this.users = this.users.map((u) => {
			if (u.id === id) {
				user = {
					id: u.id,
					name,
					surname,
					email,
					password,
					role,
					created_at: u.created_at
				};
				return user;
			}
			return u;
		});

		return user;
	}
	async delete(id: string): Promise<User> {
		let user: User;
		const userIndex = this.users.findIndex((u) => u.id === id);
		if (userIndex != -1) {
			const deleted = this.users.splice(userIndex, 1);
			user = deleted[0];
		}
		return user;
	}

	async findByEmail(email: string): Promise<User> {
		return this.users.find((user) => user.email === email);
	}

	async findById(id: string): Promise<User> {
		return this.users.find((user) => user.id === id);
	}

	async findAll(): Promise<User[]> {
		const results = [...this.users];
		return results;
	}
}

export { UsersRepositoryInMemory };
