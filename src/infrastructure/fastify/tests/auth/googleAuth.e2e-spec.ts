import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
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

const GOOGLE_MAX = 5;

interface ErrorBody {
	ok: boolean;
	localeKey: string;
	message: string;
}

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
	if (!setCookie) {
		return false;
	}
	const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
	return cookies.some((cookie) => cookie.startsWith(`${AUTH_COOKIE}=`));
};

describe('Google Sign-In', () => {
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

	afterEach(() => {
		resetFakeGoogleTokenVerifier();
	});

	it('branch (c): creates a new account, sets the auth cookie and session', async () => {
		setNextVerifiedGoogleIdentity(verifiedIdentity);

		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(200);
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(true);

		const created = await UserModel.findOne({ email: verifiedIdentity.email }).exec();
		expect(created).not.toBeNull();
		expect(created?.status).toBe('active');
		expect(created?.email_verified).toBe(true);
	});

	it('branch (c): creates an incomplete_profile account when familyName is missing', async () => {
		const { familyName: _omitted, ...withoutFamily } = verifiedIdentity;
		setNextVerifiedGoogleIdentity(withoutFamily);

		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(200);
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(true);

		const created = await UserModel.findOne({ email: verifiedIdentity.email }).exec();
		expect(created).not.toBeNull();
		expect(created?.status).toBe('incomplete_profile');
		expect(created?.surname).toBeUndefined();
		expect(created?.name).toBe(verifiedIdentity.givenName);
	});

	it('branch (c): creates an incomplete_profile account when givenName is missing', async () => {
		const { givenName: _omitted, ...withoutGiven } = verifiedIdentity;
		setNextVerifiedGoogleIdentity(withoutGiven);

		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(200);
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(true);

		const created = await UserModel.findOne({ email: verifiedIdentity.email }).exec();
		expect(created).not.toBeNull();
		expect(created?.status).toBe('incomplete_profile');
		expect(created?.name).toBeUndefined();
		expect(created?.surname).toBe(verifiedIdentity.familyName);
	});

	it('branch (a): signs in an existing identity', async () => {
		setNextVerifiedGoogleIdentity(verifiedIdentity);
		await request(app.server).post('/google').send({ idToken });

		setNextVerifiedGoogleIdentity(verifiedIdentity);
		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(200);
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(true);

		const identities = await resolveIdentitiesRepository().findByUserId(
			(await UserModel.findOne({ email: verifiedIdentity.email }).exec())!._id.toString(),
		);
		expect(identities).toHaveLength(1);
	});

	it('requires explicit profile linking for an existing local account with the same verified email', async () => {
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

		const linked = await IdentityModel.findOne({
			provider: IdentityProviders.google,
			provider_sub: verifiedIdentity.subject,
		}).exec();
		expect(linked).toBeNull();
		expect((await UserModel.findOne({ email }).exec())?.status).toBe('active');
	});

	it('returns 401 googleEmailNotVerified when the token email is not verified', async () => {
		setNextVerifiedGoogleIdentity({ ...verifiedIdentity, isEmailVerified: false });

		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(401);
		expect((response.body as ErrorBody).localeKey).toBe('apiResponses.auth.googleEmailNotVerified');
	});

	it('enforces the same rate limit as /signin once invalid-credentials failures exceed the window', async () => {
		// An orphan identity makes every request fail with invalidCredentials, which
		// counts toward the limit. After MAX+1 counted failures the next request is
		// throttled with 429 — mirroring the /signin policy exactly.
		const orphanIdentity: VerifiedGoogleIdentity = { ...verifiedIdentity, subject: 'orphan-sub' };
		await IdentityModel.create({
			user_id: '000000000000000000000000',
			provider: IdentityProviders.google,
			provider_sub: orphanIdentity.subject,
		});

		for (let attempt = 0; attempt < GOOGLE_MAX + 1; attempt += 1) {
			setNextVerifiedGoogleIdentity(orphanIdentity);
			await request(app.server).post('/google').send({ idToken });
		}

		setNextVerifiedGoogleIdentity(orphanIdentity);
		const limited = await request(app.server).post('/google').send({ idToken });

		expect(limited.status).toBe(HTTP_STATUS.too_many_requests);
		expect((limited.body as ErrorBody).localeKey).toBe('apiResponses.auth.tooManyRequests');
		expect(limited.headers['retry-after']).toBeDefined();
	});
});
