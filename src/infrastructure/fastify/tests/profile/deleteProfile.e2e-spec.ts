import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { AdministrativeEventModel } from '@/core/accounts/infra/mongo/entities/administrativeEvent.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { resolveCommentsRepository, resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { CommentModel } from '@/core/engagement/infra/mongo/entities/comment.model';
import { RatingModel } from '@/core/engagement/infra/mongo/entities/rating.model';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Roles } from '@/shared/accessControl/roles';
import { AUTH_COOKIE } from '@/infrastructure/fastify/constants/cookie.constants';
import { AUTH_SESSION_COOKIE } from '@/infrastructure/fastify/constants/session.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';

type ErrorResponseBody = { localeKey: string };

describe('Delete Profile', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(CommentModel);
		await MongoConnection.Instance.emptyCollection(RatingModel);
		await MongoConnection.Instance.emptyCollection(AdministrativeEventModel);
	});

	it('closes the profile, deletes comments and preserves ratings', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const commentsRepository = resolveCommentsRepository();
		const ratingsRepository = resolveRatingsRepository();
		const comment = await commentsRepository.create({
			drink_id: new ObjectId().toString(),
			user_id: user.id,
			content: 'Comment that must be erased with the account',
		});
		const rating = await ratingsRepository.create({
			drink_id: new ObjectId().toString(),
			user_id: user.id,
			value: 5,
		});

		const response = await request(app.server).delete('/me').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.no_content);
		const clearedCookies = response.headers['set-cookie'] as unknown as string[];
		expect(clearedCookies).toEqual(
			expect.arrayContaining([
				expect.stringContaining(`${AUTH_COOKIE}=;`),
				expect.stringContaining(`${AUTH_SESSION_COOKIE}=;`),
			]),
		);
		expect(await UserModel.findById(user.id).lean()).toBeNull();
		expect(await commentsRepository.findById(comment._id.toString())).toBeNull();
		expect(await ratingsRepository.findById(rating._id.toString())).toMatchObject({ user_id: user.id, value: 5 });
		expect(
			await AdministrativeEventModel.findOne({ action: AdministrativeEventActions.userClosed }).lean(),
		).toMatchObject({
			actor_id: user.id,
			target_user_id: user.id,
			before: { role: Roles.admin, status: 'active' },
			origin: 'api',
		});
	});

	it('does not let the owner close their own profile', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.owner });

		const response = await request(app.server).delete('/me').set('Cookie', cookies).send();

		expect(response.status).toBe(HTTP_STATUS.forbidden);
		expect((response.body as ErrorResponseBody).localeKey).toBe(
			'apiResponses.users.ownerManagementRequiresTransfer',
		);
		expect(await UserModel.findById(user.id).lean().exec()).not.toBeNull();
		expect(await AdministrativeEventModel.countDocuments()).toBe(0);
	});
});
