import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resetFakeGoogleIdentityProvider, setNextVerifiedGoogleIdentity } from '@/shared/providers/googleAuth';
import {
	GOOGLE_POPUP_HEADERS,
	mergeCookies,
} from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';

const code = 'google-password-setup-code';
const password = 'Created-password-123456';
const googleIdentity = {
	subject: 'google-password-setup-sub',
	email: 'provider-only@example.com',
	isEmailVerified: true,
	givenName: 'Provider',
	familyName: 'Only',
};
type ProfileResponseBody = {
	authenticationMethods: {
		password: { enabled: boolean; removable: boolean };
		providers: string[];
		disconnectableProviders: string[];
	};
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
		resetFakeGoogleIdentityProvider();
	});

	it('allows a Google-only account to add password login while preserving Google login', async () => {
		setNextVerifiedGoogleIdentity(googleIdentity);
		const googleLogin = await request(app.server).post('/google').set(GOOGLE_POPUP_HEADERS).send({ code });
		const cookies = googleLogin.headers['set-cookie'];
		expect((await request(app.server).get('/me').set('Cookie', cookies)).body as ProfileResponseBody).toMatchObject(
			{
				authenticationMethods: {
					password: { enabled: false, removable: false },
					providers: ['google'],
					disconnectableProviders: [],
				},
			},
		);

		setNextVerifiedGoogleIdentity(googleIdentity);
		expect(
			(
				await request(app.server)
					.post('/me/reauthentication/google')
					.set('Cookie', cookies)
					.set(GOOGLE_POPUP_HEADERS)
					.send({ code })
			).status,
		).toBe(HTTP_STATUS.no_content);
		const createPassword = await request(app.server).post('/me/password').set('Cookie', cookies).send({ password });
		expect(createPassword.status).toBe(HTTP_STATUS.no_content);
		const rotatedCookies = createPassword.headers['set-cookie'] as unknown as string[];
		expect(
			(await request(app.server).get('/me').set('Cookie', rotatedCookies)).body as ProfileResponseBody,
		).toMatchObject({
			authenticationMethods: {
				password: { enabled: true, removable: true },
				providers: ['google'],
				disconnectableProviders: ['google'],
			},
		});
		expect((await request(app.server).post('/signin').send({ email: googleIdentity.email, password })).status).toBe(
			HTTP_STATUS.ok,
		);
	});

	it('allows an account that started with Google to disconnect it after adding a password', async () => {
		setNextVerifiedGoogleIdentity(googleIdentity);
		const googleLogin = await request(app.server).post('/google').set(GOOGLE_POPUP_HEADERS).send({ code });
		const cookies = googleLogin.headers['set-cookie'];
		setNextVerifiedGoogleIdentity(googleIdentity);
		await request(app.server)
			.post('/me/reauthentication/google')
			.set('Cookie', cookies)
			.set(GOOGLE_POPUP_HEADERS)
			.send({ code });
		const createPassword = await request(app.server).post('/me/password').set('Cookie', cookies).send({ password });
		const passwordCookies = createPassword.headers['set-cookie'] as unknown as string[];
		// Creating the password rotates the session, which ends the recent authentication the disconnection asks for.
		const reauthentication = await request(app.server)
			.post('/me/reauthentication/password')
			.set('Cookie', passwordCookies)
			.send({ password });
		expect(reauthentication.status).toBe(HTTP_STATUS.no_content);
		const reauthenticatedCookies = mergeCookies(passwordCookies, reauthentication.headers['set-cookie']);

		const unlinked = await request(app.server)
			.delete('/me/identities/google')
			.set('Cookie', reauthenticatedCookies);

		expect(unlinked.status).toBe(HTTP_STATUS.no_content);
		const rotatedCookies = unlinked.headers['set-cookie'] as unknown as string[];
		expect(
			(await request(app.server).get('/me').set('Cookie', rotatedCookies)).body as ProfileResponseBody,
		).toMatchObject({
			authenticationMethods: {
				password: { enabled: true, removable: false },
				providers: [],
				disconnectableProviders: [],
			},
		});
		expect((await request(app.server).post('/signin').send({ email: googleIdentity.email, password })).status).toBe(
			HTTP_STATUS.ok,
		);
	});

	it('allows an account with a connected provider to remove its password', async () => {
		setNextVerifiedGoogleIdentity(googleIdentity);
		const googleLogin = await request(app.server).post('/google').set(GOOGLE_POPUP_HEADERS).send({ code });
		const cookies = googleLogin.headers['set-cookie'];
		setNextVerifiedGoogleIdentity(googleIdentity);
		await request(app.server)
			.post('/me/reauthentication/google')
			.set('Cookie', cookies)
			.set(GOOGLE_POPUP_HEADERS)
			.send({ code });
		const createPassword = await request(app.server).post('/me/password').set('Cookie', cookies).send({ password });
		const passwordCookies = createPassword.headers['set-cookie'] as unknown as string[];
		// Creating the password rotates the session, which ends the recent authentication the removal asks for.
		const reauthentication = await request(app.server)
			.post('/me/reauthentication/password')
			.set('Cookie', passwordCookies)
			.send({ password });
		const reauthenticatedCookies = mergeCookies(passwordCookies, reauthentication.headers['set-cookie']);

		const removed = await request(app.server).delete('/me/password').set('Cookie', reauthenticatedCookies);

		expect(removed.status).toBe(HTTP_STATUS.no_content);
		const rotatedCookies = removed.headers['set-cookie'] as unknown as string[];
		expect(
			(await request(app.server).get('/me').set('Cookie', rotatedCookies)).body as ProfileResponseBody,
		).toMatchObject({
			authenticationMethods: {
				password: { enabled: false, removable: false },
				providers: ['google'],
				disconnectableProviders: [],
			},
		});
		expect(
			(await request(app.server).post('/signin').send({ email: googleIdentity.email, password })).status,
		).not.toBe(HTTP_STATUS.ok);
	});
});
