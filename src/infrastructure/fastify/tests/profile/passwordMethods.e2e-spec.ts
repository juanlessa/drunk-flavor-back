import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resetFakeGoogleTokenVerifier, setNextVerifiedGoogleIdentity } from '@/shared/providers/googleAuth';

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
	authenticationMethods: { password: { enabled: boolean }; providers: string[] };
};

describe('Profile password methods', () => {
	beforeAll(async () => app.ready());
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
		expect((await request(app.server).get('/me').set('Cookie', cookies)).body as ProfileResponseBody).toMatchObject(
			{
				authenticationMethods: { password: { enabled: false }, providers: ['google'] },
			},
		);

		setNextVerifiedGoogleIdentity(googleIdentity);
		expect(
			(await request(app.server).post('/me/reauthentication/google').set('Cookie', cookies).send({ idToken }))
				.status,
		).toBe(HTTP_STATUS.no_content);
		expect((await request(app.server).post('/me/password').set('Cookie', cookies).send({ password })).status).toBe(
			HTTP_STATUS.no_content,
		);
		expect((await request(app.server).get('/me').set('Cookie', cookies)).body as ProfileResponseBody).toMatchObject(
			{
				authenticationMethods: { password: { enabled: true }, providers: ['google'] },
			},
		);
		expect((await request(app.server).post('/signin').send({ email: googleIdentity.email, password })).status).toBe(
			HTTP_STATUS.ok,
		);
	});
});
