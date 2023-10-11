import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { ICreateUser, IUpdateUser } from '@modules/accounts/dtos/user.dtos';
import { ObjectId } from 'bson';
import { IUser } from '@modules/accounts/entities/user.entity';

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
		let user: IUser;

		this.users = this.users.map((u) => {
			if (u._id === id) {
				user = {
					_id: u._id,
					name: data.name ?? u.name,
					surname: data.surname ?? u.surname,
					email: data.email ?? u.email,
					password: data.password ?? u.password,
					role: data.role ?? u.role,
					created_at: u.created_at,
					updated_at: new Date()
				};
				return user;
			}
			return u;
		});

		return user;
	}
	async delete(id: string): Promise<IUser> {
		let user: IUser;
		const userIndex = this.users.findIndex((u) => u._id === id);
		if (userIndex != -1) {
			const deleted = this.users.splice(userIndex, 1);
			user = deleted[0];
		}
		return user;
	}

	async findByEmail(email: string): Promise<IUser> {
		return this.users.find((user) => user.email === email);
	}

	async findById(id: string): Promise<IUser> {
		return this.users.find((user) => user._id === id);
	}

	async findAll(): Promise<IUser[]> {
		const results = [...this.users];
		return results;
	}
}

export { UsersRepositoryInMemory };
