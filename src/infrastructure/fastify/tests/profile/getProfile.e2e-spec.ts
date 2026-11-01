import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { Roles } from '@/shared/accessControl/roles';
import { resolveAccountsModule } from '@/core/accounts/public';
import { AUTH_COOKIE } from '@/infrastructure/fastify/constants/cookie.constants';
import { AUTH_SESSION_COOKIE } from '@/infrastructure/fastify/constants/session.constants';

type ProfileResponseBody = {
	authenticationMethods: {
		password: { enabled: boolean };
		providers: string[];
	};
};

describe('Get Profile', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(CredentialModel);
		await MongoConnection.Instance.emptyCollection(IdentityModel);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('Should be able to get the profile', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.partner });

		const response = await request(app.server).get('/me').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect((response.body as ProfileResponseBody).authenticationMethods).toEqual({
			password: { enabled: true },
			providers: [],
		});
	});

	it('returns a server error without clearing cookies when the user lookup fails', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.partner });
		vi.spyOn(resolveAccountsModule(), 'findUserById').mockRejectedValueOnce(new Error('database unavailable'));

		const response = await request(app.server).get('/me').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.internal_server_error);
		const setCookies = (response.headers['set-cookie'] ?? []) as unknown as string[];
		expect(setCookies).not.toEqual(expect.arrayContaining([expect.stringContaining(`${AUTH_COOKIE}=;`)]));
		expect(setCookies).not.toEqual(expect.arrayContaining([expect.stringContaining(`${AUTH_SESSION_COOKIE}=;`)]));
	});
});
