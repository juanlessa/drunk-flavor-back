import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resetFakeGoogleIdentityProvider, setNextVerifiedGoogleIdentity } from '@/shared/providers/googleAuth';
import {
	createAndAuthenticateUser,
	GOOGLE_POPUP_HEADERS,
} from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';

const code = 'google-link-code';
const googleIdentity = {
	subject: 'explicit-google-link-sub',
	email: 'secondary-google@example.com',
	isEmailVerified: true,
	givenName: 'Secondary',
	familyName: 'Google',
};
type ProfileResponseBody = {
	avatarUrl?: string;
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
		resetFakeGoogleIdentityProvider();
	});

	it('connects Google after recent authentication and preserves both login methods', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { email: 'primary-local@example.com' });
		setNextVerifiedGoogleIdentity(googleIdentity);

		const linked = await request(app.server)
			.post('/me/identities/google')
			.set('Cookie', cookies)
			.set(GOOGLE_POPUP_HEADERS)
			.send({ code });

		expect(linked.status).toBe(HTTP_STATUS.no_content);
		const rotatedCookies = linked.headers['set-cookie'] as unknown as string[];
		const profile = await request(app.server).get('/me').set('Cookie', rotatedCookies);
		expect((profile.body as ProfileResponseBody).authenticationMethods).toEqual({
			password: { enabled: true },
			providers: ['google'],
		});
		setNextVerifiedGoogleIdentity(googleIdentity);
		expect((await request(app.server).post('/google').set(GOOGLE_POPUP_HEADERS).send({ code })).status).toBe(
			HTTP_STATUS.ok,
		);
		expect(
			(await request(app.server).post('/signin').send({ email: user.email, password: user.password })).status,
		).toBe(HTTP_STATUS.ok);
	});

	it('uses the picture of the Google account as the avatar of a user who has none', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { email: 'no-avatar@example.com' });
		setNextVerifiedGoogleIdentity({ ...googleIdentity, pictureUrl: 'https://lh3.googleusercontent.com/a/picture' });

		const linked = await request(app.server)
			.post('/me/identities/google')
			.set('Cookie', cookies)
			.set(GOOGLE_POPUP_HEADERS)
			.send({ code });

		const rotatedCookies = linked.headers['set-cookie'] as unknown as string[];
		const profile = await request(app.server).get('/me').set('Cookie', rotatedCookies);
		expect((profile.body as ProfileResponseBody).avatarUrl).toBe('https://lh3.googleusercontent.com/a/picture');
	});
});
