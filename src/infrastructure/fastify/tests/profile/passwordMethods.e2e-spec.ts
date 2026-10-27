import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { resetFakeGoogleTokenVerifier, setNextVerifiedGoogleIdentity } from '@/shared/providers/googleAuth';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';

const idToken = 'google-password-setup-token';
const password = 'Created-password-123456';
const googleIdentity = {
	subject: 'google-password-setup-sub',
	email: 'provider-only@example.com',
	isEmailVerified: true,
	givenName: 'Provider',
	familyName: 'Only',
};

type ProfileResponseBody = {
	authentication_methods: {
		password: { enabled: boolean };
		providers: string[];
	};
};

type ErrorResponseBody = { localeKey: string };

describe('Profile password methods', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await resolveRateLimitStore().reset();
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(IdentityModel);
		await MongoConnection.Instance.emptyCollection(CredentialModel);
		await resolveRateLimitStore().reset();
		resetFakeGoogleTokenVerifier();
	});

	it('allows a Google-only account to add password login while preserving Google login', async () => {
		setNextVerifiedGoogleIdentity(googleIdentity);
		const googleLogin = await request(app.server).post('/google').send({ idToken });
		const cookies = googleLogin.headers['set-cookie'];

		const before = await request(app.server).get('/me').set('Cookie', cookies);
		expect((before.body as ProfileResponseBody).authentication_methods).toEqual({
			password: { enabled: false },
			providers: ['google'],
		});

		setNextVerifiedGoogleIdentity(googleIdentity);
		const reauthenticated = await request(app.server)
			.post('/me/reauthentication/google')
			.set('Cookie', cookies)
			.send({ idToken });
		expect(reauthenticated.status).toBe(HTTP_STATUS.no_content);

		const created = await request(app.server).post('/me/password').set('Cookie', cookies).send({ password });
		expect(created.status).toBe(HTTP_STATUS.no_content);

		const after = await request(app.server).get('/me').set('Cookie', cookies);
		expect((after.body as ProfileResponseBody).authentication_methods).toEqual({
			password: { enabled: true },
			providers: ['google'],
		});

		const passwordLogin = await request(app.server).post('/signin').send({ email: googleIdentity.email, password });
		expect(passwordLogin.status).toBe(HTTP_STATUS.ok);

		setNextVerifiedGoogleIdentity(googleIdentity);
		const secondGoogleLogin = await request(app.server).post('/google').send({ idToken });
		expect(secondGoogleLogin.status).toBe(HTTP_STATUS.ok);
	});

	it('rejects creating a second credential', async () => {
		setNextVerifiedGoogleIdentity(googleIdentity);
		const googleLogin = await request(app.server).post('/google').send({ idToken });
		const cookies = googleLogin.headers['set-cookie'];

		await request(app.server).post('/me/password').set('Cookie', cookies).send({ password });
		const duplicate = await request(app.server)
			.post('/me/password')
			.set('Cookie', cookies)
			.send({ password: 'Another-password-123456' });

		expect(duplicate.status).toBe(HTTP_STATUS.conflict);
		expect((duplicate.body as ErrorResponseBody).localeKey).toBe('apiResponses.profile.passwordAlreadyConfigured');
	});
});
