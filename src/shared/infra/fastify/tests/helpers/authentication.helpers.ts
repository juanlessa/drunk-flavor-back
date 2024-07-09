import request from 'supertest';
import { FastifyInstance } from 'fastify';
import { resolveCreateUserService } from '@/modules/accounts/useCases/createUser/createUser.container';
import { UserRole } from '@/modules/accounts/entities/user.entity';
import { createUserFactory } from '@/modules/accounts/container';
import { DeepPartial } from '@/shared/types/utility.types';
import { CreateUser } from '@/modules/accounts/dtos/user.dtos';

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
