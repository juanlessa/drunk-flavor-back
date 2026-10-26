import request from 'supertest';
import { FastifyInstance } from 'fastify';
import { DeepPartial } from '@/shared/types/utility.types';
import { CreateUser } from '@/core/accounts/dtos/user.dtos';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { resolveUsersRepository, resolveCredentialsRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';

export const createUser = async (
	_app: FastifyInstance,
	userOptions?: DeepPartial<CreateUser> & { password?: string },
) => {
	const usersRepository = resolveUsersRepository();
	const credentialsRepository = resolveCredentialsRepository();
	const hashProvider = resolveHashProvider();
	const password = userOptions?.password || 'Password-12345678';
	const userData = createUserFactory(userOptions);
	const user = await usersRepository.create(userData);
	await credentialsRepository.create({
		user_id: user._id.toString(),
		password_hash: await hashProvider.hash(password),
	});
	return { ...userData, password, id: user._id.toString() };
};

export async function createAndAuthenticateUser(
	app: FastifyInstance,
	userOptions?: DeepPartial<CreateUser> & { password?: string },
) {
	const user = await createUser(app, userOptions);
	const { email, password } = user;

	const response = await request(app.server).post('/signin').send({
		email,
		password,
	});

	const cookies = response.headers['set-cookie'];

	return {
		cookies,
		user,
	};
}
