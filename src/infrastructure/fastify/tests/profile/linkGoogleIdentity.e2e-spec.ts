import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { resetFakeGoogleTokenVerifier, setNextVerifiedGoogleIdentity } from '@/shared/providers/googleAuth';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { RECENT_AUTHENTICATION_WINDOW_MS } from '@/core/accounts/constants/reauthentication.constants';

const idToken = 'google-link-token';
const googleIdentity = {
	subject: 'explicit-google-link-sub',
	email: 'secondary-google@example.com',
	isEmailVerified: true,
	givenName: 'Secondary',
	familyName: 'Google',
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
		vi.useFakeTimers({ toFake: ['Date'] });
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(CredentialModel);
		await MongoConnection.Instance.emptyCollection(IdentityModel);
		await resolveRateLimitStore().reset();
		resetFakeGoogleTokenVerifier();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('connects Google after recent authentication and enables both login methods', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, {
			email: 'primary-local@example.com',
		});
		setNextVerifiedGoogleIdentity(googleIdentity);

		const linked = await request(app.server).post('/me/identities/google').set('Cookie', cookies).send({ idToken });
		expect(linked.status).toBe(HTTP_STATUS.no_content);

		const profile = await request(app.server).get('/me').set('Cookie', cookies);
		expect((profile.body as ProfileResponseBody).authentication_methods).toEqual({
			password: { enabled: true },
			providers: ['google'],
		});

		setNextVerifiedGoogleIdentity(googleIdentity);
		expect((await request(app.server).post('/google').send({ idToken })).status).toBe(HTTP_STATUS.ok);
		expect(
			(await request(app.server).post('/signin').send({ email: user.email, password: user.password })).status,
		).toBe(HTTP_STATUS.ok);
	});

	it('rejects linking when recent authentication has expired', async () => {
		const { cookies } = await createAndAuthenticateUser(app);
		setNextVerifiedGoogleIdentity(googleIdentity);
		vi.advanceTimersByTime(RECENT_AUTHENTICATION_WINDOW_MS + 1);

		const response = await request(app.server)
			.post('/me/identities/google')
			.set('Cookie', cookies)
			.send({ idToken });

		expect(response.status).toBe(HTTP_STATUS.unauthorized);
		expect(await IdentityModel.countDocuments()).toBe(0);
	});
});
