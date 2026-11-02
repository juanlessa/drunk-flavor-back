import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { resetFakeGoogleIdentityProvider, setNextVerifiedGoogleIdentity } from '@/shared/providers/googleAuth';
import { GOOGLE_POPUP_HEADERS } from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';
import { VerifiedGoogleIdentity } from '@/shared/providers/googleAuth/googleAuth.dtos';
import { AUTH_COOKIE } from '@/infrastructure/fastify/constants/cookie.constants';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { app } from '@/infrastructure/fastify/app';

const code = 'any-google-authorization-code';
const verifiedIdentity: VerifiedGoogleIdentity = {
	subject: 'google-e2e-sub-123',
	email: 'googleuser@example.com',
	isEmailVerified: true,
	givenName: 'Google',
	familyName: 'User',
	pictureUrl: 'https://example.com/avatar.png',
};

const hasAuthCookie = (setCookie: string | string[] | undefined): boolean => {
	const cookies = setCookie ? (Array.isArray(setCookie) ? setCookie : [setCookie]) : [];
	return cookies.some((cookie) => cookie.startsWith(`${AUTH_COOKIE}=`));
};

describe('Google Sign-In', () => {
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
	afterEach(() => resetFakeGoogleIdentityProvider());

	it('creates a new account and authenticated session', async () => {
		setNextVerifiedGoogleIdentity(verifiedIdentity);
		const response = await request(app.server).post('/google').set(GOOGLE_POPUP_HEADERS).send({ code });

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(true);
		expect(await UserModel.findOne({ email: verifiedIdentity.email }).lean()).toMatchObject({
			status: 'active',
			email_verified: true,
		});
	});

	it('rejects a request without the X-Requested-With CSRF header', async () => {
		setNextVerifiedGoogleIdentity(verifiedIdentity);
		const response = await request(app.server).post('/google').send({ code });

		expect(response.status).toBe(HTTP_STATUS.forbidden);
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(false);
		expect(await UserModel.countDocuments()).toBe(0);
	});
});
