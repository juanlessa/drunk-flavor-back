import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resetFakeGoogleTokenVerifier, setNextVerifiedGoogleIdentity } from '@/shared/providers/googleAuth';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';

const idToken = 'google-link-token';
const googleIdentity = {
	subject: 'explicit-google-link-sub',
	email: 'secondary-google@example.com',
	isEmailVerified: true,
	givenName: 'Secondary',
	familyName: 'Google',
};
type ProfileResponseBody = {
	authenticationMethods: { password: { enabled: boolean }; providers: string[] };
};

describe('Link Google identity', () => {
	beforeAll(async () => app.ready());
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

	it('connects Google after recent authentication and preserves both login methods', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { email: 'primary-local@example.com' });
		setNextVerifiedGoogleIdentity(googleIdentity);

		const linked = await request(app.server).post('/me/identities/google').set('Cookie', cookies).send({ idToken });

		expect(linked.status).toBe(HTTP_STATUS.no_content);
		const profile = await request(app.server).get('/me').set('Cookie', cookies);
		expect((profile.body as ProfileResponseBody).authenticationMethods).toEqual({
			password: { enabled: true },
			providers: ['google'],
		});
		setNextVerifiedGoogleIdentity(googleIdentity);
		expect((await request(app.server).post('/google').send({ idToken })).status).toBe(HTTP_STATUS.ok);
		expect(
			(await request(app.server).post('/signin').send({ email: user.email, password: user.password })).status,
		).toBe(HTTP_STATUS.ok);
	});
});
