import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { Roles } from '@/shared/accessControl/roles';
import { AUTH_COOKIE } from '@/infrastructure/fastify/constants/cookie.constants';
import { AUTH_SESSION_COOKIE } from '@/infrastructure/fastify/constants/session.constants';

type ErrorResponseBody = { localeKey: string };

describe('Update Password', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('reauthenticates with password and rotates the current session after password update', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.partner });
		const { password: currentPassword } = user;

		const invalidReauthentication = await request(app.server)
			.post('/me/reauthentication/password')
			.set('Cookie', cookies)
			.send({ password: 'Wrong-password-123' });
		expect(invalidReauthentication.status).toBe(HTTP_STATUS.unauthorized);

		const validReauthentication = await request(app.server)
			.post('/me/reauthentication/password')
			.set('Cookie', cookies)
			.send({ password: currentPassword });
		expect(validReauthentication.status).toBe(HTTP_STATUS.no_content);

		const newPassword = 'New-password-87654321';
		const response = await request(app.server).patch('/me/password').set('Cookie', cookies).send({
			currentPassword,
			newPassword,
		});

		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(await UserModel.findById(user.id).lean()).toMatchObject({ session_version: 2 });
		const rotatedCookies = response.headers['set-cookie'] as unknown as string[];
		expect(rotatedCookies).toEqual(
			expect.arrayContaining([
				expect.stringContaining(`${AUTH_COOKIE}=`),
				expect.stringContaining(`${AUTH_SESSION_COOKIE}=`),
			]),
		);

		const consumedProofResponse = await request(app.server).delete('/me').set('Cookie', rotatedCookies).send();
		expect(consumedProofResponse.status).toBe(HTTP_STATUS.unauthorized);
		expect((consumedProofResponse.body as ErrorResponseBody).localeKey).toBe(
			'apiResponses.profile.recentAuthenticationRequired',
		);
	});
});
