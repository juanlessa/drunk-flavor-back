import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { IdentityModel } from '@/core/accounts/infra/mongo/entities/identity.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { CommentModel } from '@/core/engagement/infra/mongo/entities/comment.model';
import { resetFakeGoogleTokenVerifier, setNextVerifiedGoogleIdentity } from '@/shared/providers/googleAuth';
import { VerifiedGoogleIdentity } from '@/shared/providers/googleAuth/googleAuth.dtos';
import { resolveRateLimitStore } from '@/infrastructure/fastify/rateLimitStore';
import { createDrink } from '../helpers/drink.helpers';

interface ErrorBody {
	ok: boolean;
	localeKey: string;
	message: string;
}

const idToken = 'any-google-id-token';

// A verified Google identity without `familyName` creates an `incomplete_profile` account.
const incompleteIdentity: VerifiedGoogleIdentity = {
	subject: 'google-incomplete-sub',
	email: 'incomplete@example.com',
	isEmailVerified: true,
	givenName: 'Incomplete',
	pictureUrl: 'https://example.com/avatar.png',
};

describe('enforceCompleteProfile gate', () => {
	beforeAll(async () => {
		await app.ready();
		await CommentModel.init();
	});

	afterAll(async () => {
		await resolveRateLimitStore().reset();
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(IdentityModel);
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(DrinkModel);
		await MongoConnection.Instance.emptyCollection(CommentModel);
		await resolveRateLimitStore().reset();
		resetFakeGoogleTokenVerifier();
	});

	afterEach(() => {
		resetFakeGoogleTokenVerifier();
	});

	it('blocks a business route for an incomplete profile, then allows it after completion', async () => {
		setNextVerifiedGoogleIdentity(incompleteIdentity);
		const authResponse = await request(app.server).post('/google').send({ idToken });
		expect(authResponse.status).toBe(200);
		const cookies = authResponse.headers['set-cookie'];

		const { id: drink_id } = await createDrink();

		// The incomplete-profile user is gated out of the business route.
		const blocked = await request(app.server)
			.post('/comments')
			.set('Cookie', cookies)
			.send({ drink_id, content: 'before completion' });

		expect(blocked.status).toBe(HTTP_STATUS.forbidden);
		expect((blocked.body as ErrorBody).localeKey).toBe('apiResponses.auth.profileIncomplete');

		// Completing the profile promotes the account and re-issues the access token.
		const completion = await request(app.server)
			.patch('/me')
			.set('Cookie', cookies)
			.send({ name: 'Incomplete', surname: 'User' });

		expect(completion.status).toBe(HTTP_STATUS.no_content);
		const refreshedCookies = completion.headers['set-cookie'];

		const promoted = await UserModel.findOne({ email: incompleteIdentity.email }).exec();
		expect(promoted?.status).toBe('active');
		expect(promoted?.surname).toBe('User');

		// The same business route now passes the profile gate.
		const allowed = await request(app.server)
			.post('/comments')
			.set('Cookie', refreshedCookies)
			.send({ drink_id, content: 'after completion' });

		expect(allowed.status).toBe(HTTP_STATUS.created);
	});
});
