import request from 'supertest';
import { FastifyInstance } from 'fastify';
import { DeepPartial } from '@/shared/types/utility.types';
import { CreateUser } from '@/core/accounts/dtos/user.dtos';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';

export const createUser = async (_app: FastifyInstance, userOptions?: DeepPartial<CreateUser>) => {
	const usersRepository = resolveUsersRepository();
	const hashProvider = resolveHashProvider();
	const { password, ...userData } = createUserFactory(userOptions);
	const user = await usersRepository.create({ ...userData, password: await hashProvider.hash(password) });
	return { ...userData, password, id: user._id.toString() };
};

export async function createAndAuthenticateUser(app: FastifyInstance, userOptions?: DeepPartial<CreateUser>) {
	const user = await createUser(app, userOptions);

	const response = await request(app.server).post('/login').send({
		email: user.email,
		password: user.password,
	});

	const cookies = response.headers['set-cookie'];

	return {
		cookies,
		user,
	};
}
