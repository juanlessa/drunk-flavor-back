import { ICreateUser, IUpdateUser } from '@modules/accounts/dtos/Users';
import User from '@modules/accounts/entities/User';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '@shared/infra/prisma';

class UsersRepository implements IUsersRepository {
	private prismaClient: PrismaClient;

	constructor() {
		this.prismaClient = getPrismaClient();
	}

	async create(data: ICreateUser): Promise<User> {
		const user = await this.prismaClient.user.create({ data });
		return user;
	}
	async update(data: IUpdateUser): Promise<User> {
		const user = await this.prismaClient.user.update({
			where: { id: data.id },
			data: {
				name: data.name,
				email: data.email,
				password: data.password,
				role: data.role
			}
		});
		return user;
	}

	async delete(id: string): Promise<User> {
		const user = await this.prismaClient.user.delete({
			where: { id }
		});

		return user;
	}

	async findById(id: string): Promise<User> {
		const results = await this.prismaClient.user.findUnique({ where: { id } });
		return results;
	}
	async findByEmail(email: string): Promise<User> {
		const results = await this.prismaClient.user.findUnique({ where: { email } });
		return results;
	}
	async findAll(): Promise<User[]> {
		const results = await this.prismaClient.user.findMany();
		return results;
	}
}

export { UsersRepository };
