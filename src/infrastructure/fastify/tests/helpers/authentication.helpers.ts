import request from 'supertest';
import { FastifyInstance } from 'fastify';
import { resolveCreateUserService } from '@/core/accounts/useCases/createUser/createUser.container';
import { DeepPartial } from '@/shared/types/utility.types';
import { CreateUser } from '@/core/accounts/dtos/user.dtos';
import { createUserFactory } from '@/core/accounts/factories/user.factories';

export const createUser = async (_app: FastifyInstance, userOptions?: DeepPartial<CreateUser>) => {
	const userData = createUserFactory(userOptions);
	const createUserService = resolveCreateUserService();
	const user = await createUserService.execute(userData);
	return { ...userData, id: user._id.toString() };
};

export async function createAndAuthenticateUser(app: FastifyInstance, userOptions?: DeepPartial<CreateUser>) {
	const user = await createUser(app, userOptions);

	const response = await request(app.server).post('/sessions').send({
		email: user.email,
		password: user.password,
	});

	const cookies = response.headers['set-cookie'];

	return {
		cookies,
		user,
	};
}
