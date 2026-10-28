import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { resetFakeGoogleTokenVerifier, setNextVerifiedGoogleIdentity } from '@/shared/providers/googleAuth';
import { VerifiedGoogleIdentity } from '@/shared/providers/googleAuth/googleAuth.dtos';
import { createUser } from '../helpers/authentication.helpers';
import { resolveIdentitiesRepository } from '@/core/accounts/infra/mongo/container';
import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { AUTH_COOKIE } from '@/infrastructure/fastify/constants/cookie.constants';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { app } from '@/infrastructure/fastify/app';

type ErrorBody = { localeKey: string };
const idToken = 'any-google-id-token';
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
		resetFakeGoogleTokenVerifier();
	});
	afterEach(() => resetFakeGoogleTokenVerifier());

	it('creates a new account and authenticated session', async () => {
		setNextVerifiedGoogleIdentity(verifiedIdentity);
		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(true);
		expect(await UserModel.findOne({ email: verifiedIdentity.email }).lean()).toMatchObject({
			status: 'active',
			email_verified: true,
		});
	});

	it('signs in through an existing Google identity without duplicating it', async () => {
		setNextVerifiedGoogleIdentity(verifiedIdentity);
		await request(app.server).post('/google').send({ idToken });
		setNextVerifiedGoogleIdentity(verifiedIdentity);

		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(true);
		const user = await UserModel.findOne({ email: verifiedIdentity.email }).lean();
		expect(await resolveIdentitiesRepository().findByUserId(user!._id.toString())).toHaveLength(1);
	});

	it('requires explicit linking when a local account already owns the verified email', async () => {
		const { email } = await createUser(app, {
			email: verifiedIdentity.email,
			status: 'active',
			emailVerified: true,
		});
		setNextVerifiedGoogleIdentity(verifiedIdentity);

		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(HTTP_STATUS.conflict);
		expect((response.body as ErrorBody).localeKey).toBe('apiResponses.auth.accountLinkRequired');
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(false);
		expect(
			await IdentityModel.findOne({
				provider: IdentityProviders.google,
				provider_sub: verifiedIdentity.subject,
			}).lean(),
		).toBeNull();
		expect((await UserModel.findOne({ email }).lean())?.status).toBe('active');
	});
});
