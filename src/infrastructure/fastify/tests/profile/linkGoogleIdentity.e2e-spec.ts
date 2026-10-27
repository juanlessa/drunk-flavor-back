import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { resetFakeGoogleTokenVerifier, setNextGoogleTokenPayload } from '@/shared/providers/googleAuth';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';

const idToken = 'google-link-token';
const googlePayload = {
	sub: 'explicit-google-link-sub',
	email: 'secondary-google@example.com',
	email_verified: true,
	given_name: 'Secondary',
	family_name: 'Google',
};

type ProfileResponseBody = {
	authentication_methods: {
		password: { enabled: boolean };
		providers: string[];
	};
};

describe('Link Google identity', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await resolveRateLimitStore().reset();
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(CredentialModel);
		await MongoConnection.Instance.emptyCollection(IdentityModel);
		await resolveRateLimitStore().reset();
		resetFakeGoogleTokenVerifier();
	});

	it('connects Google after verifying the current password and enables both login methods', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, {
			email: 'primary-local@example.com',
		});
		setNextGoogleTokenPayload(googlePayload);

		const linked = await request(app.server)
			.post('/me/identities/google')
			.set('Cookie', cookies)
			.send({ currentPassword: user.password, idToken });
		expect(linked.status).toBe(HTTP_STATUS.no_content);

		const profile = await request(app.server).get('/me').set('Cookie', cookies);
		expect((profile.body as ProfileResponseBody).authentication_methods).toEqual({
			password: { enabled: true },
			providers: ['google'],
		});

		setNextGoogleTokenPayload(googlePayload);
		expect((await request(app.server).post('/google').send({ idToken })).status).toBe(HTTP_STATUS.ok);
		expect(
			(await request(app.server).post('/signin').send({ email: user.email, password: user.password })).status,
		).toBe(HTTP_STATUS.ok);
	});

	it('rejects linking when the current password is invalid', async () => {
		const { cookies } = await createAndAuthenticateUser(app);
		setNextGoogleTokenPayload(googlePayload);

		const response = await request(app.server)
			.post('/me/identities/google')
			.set('Cookie', cookies)
			.send({ currentPassword: 'Wrong-password-123', idToken });

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
		expect(await IdentityModel.countDocuments()).toBe(0);
	});
});
