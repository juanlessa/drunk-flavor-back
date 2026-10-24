import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { CredentialModel } from '@/core/accounts/infra/mongo/entities/credential.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { resetFakeGoogleTokenVerifier, setNextGoogleTokenPayload } from '@/shared/providers/googleAuth';
import { GoogleTokenPayload } from '@/shared/providers/googleAuth/IGoogleTokenVerifier';
import { createUser } from '../helpers/authentication.helpers';
import { resolveIdentitiesRepository } from '@/core/accounts/infra/mongo/container';
import { IdentityProviders } from '@/core/accounts/entities/identity.entity';
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

const verifiedPayload: GoogleTokenPayload = {
	sub: 'google-e2e-sub-123',
	email: 'googleuser@example.com',
	email_verified: true,
	given_name: 'Google',
	family_name: 'User',
	picture: 'https://example.com/avatar.png',
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
		setNextGoogleTokenPayload(verifiedPayload);

		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(200);
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(true);

		const created = await UserModel.findOne({ email: verifiedPayload.email }).exec();
		expect(created).not.toBeNull();
		expect(created?.status).toBe('active');
		expect(created?.email_verified).toBe(true);
	});

	it('branch (a): signs in an existing identity', async () => {
		setNextGoogleTokenPayload(verifiedPayload);
		await request(app.server).post('/google').send({ idToken });

		setNextGoogleTokenPayload(verifiedPayload);
		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(200);
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(true);

		const identities = await resolveIdentitiesRepository().findByUserId(
			(await UserModel.findOne({ email: verifiedPayload.email }).exec())!._id.toString(),
		);
		expect(identities).toHaveLength(1);
	});

	it('branch (b): links to an existing local account by verified email', async () => {
		const { email } = await createUser(app, { email: verifiedPayload.email, status: 'pending' });

		setNextGoogleTokenPayload(verifiedPayload);
		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(200);
		expect(hasAuthCookie(response.headers['set-cookie'])).toBe(true);

		const linked = await IdentityModel.findOne({
			provider: IdentityProviders.google,
			provider_sub: verifiedPayload.sub,
		}).exec();
		expect(linked).not.toBeNull();

		const promoted = await UserModel.findOne({ email }).exec();
		expect(promoted?.status).toBe('active');
		expect(promoted?.email_verified).toBe(true);
	});

	it('returns 401 googleEmailNotVerified when the token email is not verified', async () => {
		setNextGoogleTokenPayload({ ...verifiedPayload, email_verified: false });

		const response = await request(app.server).post('/google').send({ idToken });

		expect(response.status).toBe(401);
		expect((response.body as ErrorBody).localeKey).toBe('apiResponses.auth.googleEmailNotVerified');
	});

	it('enforces the same rate limit as /signin once invalid-credentials failures exceed the window', async () => {
		// An orphan identity makes every request fail with invalidCredentials, which
		// counts toward the limit. After MAX+1 counted failures the next request is
		// throttled with 429 — mirroring the /signin policy exactly.
		const orphanPayload: GoogleTokenPayload = { ...verifiedPayload, sub: 'orphan-sub' };
		await IdentityModel.create({
			user_id: '000000000000000000000000',
			provider: IdentityProviders.google,
			provider_sub: orphanPayload.sub,
		});

		for (let attempt = 0; attempt < GOOGLE_MAX + 1; attempt += 1) {
			setNextGoogleTokenPayload(orphanPayload);
			await request(app.server).post('/google').send({ idToken });
		}

		setNextGoogleTokenPayload(orphanPayload);
		const limited = await request(app.server).post('/google').send({ idToken });

		expect(limited.status).toBe(HTTP_STATUS.too_many_requests);
		expect((limited.body as ErrorBody).localeKey).toBe('apiResponses.auth.tooManyRequests');
		expect(limited.headers['retry-after']).toBeDefined();
	});
});
