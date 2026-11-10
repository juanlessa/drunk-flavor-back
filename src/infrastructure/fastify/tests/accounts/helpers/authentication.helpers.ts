import request from 'supertest';
import { FastifyInstance } from 'fastify';
import { DeepPartial } from '@/shared/types/utility.types';
import { CreateUser } from '@/core/accounts/dtos/user.dtos';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { resolveUsersRepository, resolveCredentialsRepository } from '@/core/accounts/infra/mongo/container';
import { resolveHashProvider } from '@/shared/providers/cryptography';
import {
	REQUESTED_WITH_HEADER,
	REQUESTED_WITH_VALUE,
} from '@/infrastructure/fastify/middlewares/requireXmlHttpRequest';

/** CSRF header the frontend sends with the authorization code from the Google popup. */
export const GOOGLE_POPUP_HEADERS = { [REQUESTED_WITH_HEADER]: REQUESTED_WITH_VALUE };

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
		userId: user.id,
		passwordHash: await hashProvider.hash(password),
	});
	return { ...userData, password, id: user.id };
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

// Keeps the cookies of the earlier responses and replaces the ones that a later response set again.
export const mergeCookies = (...responses: (string[] | string | undefined)[]) => {
	const byName = new Map<string, string>();
	for (const cookies of responses) {
		for (const cookie of [cookies ?? []].flat()) {
			const pair = cookie.split(';')[0];
			byName.set(pair.split('=')[0], pair);
		}
	}
	return [...byName.values()];
};
