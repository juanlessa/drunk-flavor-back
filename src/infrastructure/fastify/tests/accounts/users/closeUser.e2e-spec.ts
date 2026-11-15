import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { AdministrativeEventActions } from '@/core/accounts/constants/administrativeEvent.constants';
import { AdministrativeEventModel } from '@/core/accounts/infra/mongo/entities/administrativeEvent.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { resolveCommentsRepository, resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { CommentModel } from '@/core/engagement/infra/mongo/entities/comment.model';
import { RatingModel } from '@/core/engagement/infra/mongo/entities/rating.model';
import { cleanupWorkerRegistration } from '@/infrastructure/workers/cleanup/cleanupWorker.registration';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Roles } from '@/shared/accessControl/roles';
import {
	createAndAuthenticateUser,
	createUser,
} from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';

const reason = 'Account closure requested after privacy review';

let cleanupWorker: ReturnType<typeof cleanupWorkerRegistration.start>;

describe('Close User', () => {
	beforeAll(async () => {
		await app.ready();
		// The account cleanup runs in the worker process in production, so the test runs the same worker.
		cleanupWorker = cleanupWorkerRegistration.start();
	});

	afterAll(async () => {
		await cleanupWorker.close();
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(CommentModel);
		await MongoConnection.Instance.emptyCollection(RatingModel);
		await MongoConnection.Instance.emptyCollection(AdministrativeEventModel);
	});

	it('closes a user, deletes comments and preserves ratings', async () => {
		const { cookies, user: actor } = await createAndAuthenticateUser(app, {
			email: 'admin@example.com',
			role: Roles.admin,
		});
		const target = await createUser(app, { email: 'partner@example.com', role: Roles.partner });
		const commentsRepository = resolveCommentsRepository();
		const ratingsRepository = resolveRatingsRepository();
		const comment = await commentsRepository.create({
			drinkId: new ObjectId().toString(),
			userId: target.id,
			content: 'Comment that must be erased with the account',
		});
		const rating = await ratingsRepository.create({
			drinkId: new ObjectId().toString(),
			userId: target.id,
			value: 4,
		});

		const suspensionResponse = await request(app.server)
			.post(`/users/${target.id}/suspension`)
			.set('Cookie', cookies)
			.send({ reason: 'Suspend account before permanent closure' });
		expect(suspensionResponse.status).toBe(HTTP_STATUS.no_content);

		const response = await request(app.server)
			.post(`/users/${target.id}/closure`)
			.set('Cookie', cookies)
			.send({ reason });

		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(await UserModel.findById(target.id).lean()).toBeNull();
		await vi.waitFor(async () => expect(await commentsRepository.findById(comment.id)).toBeNull(), {
			timeout: 10000,
		});
		expect(await ratingsRepository.findById(rating.id)).toMatchObject({ userId: target.id, value: 4 });

		const event = await AdministrativeEventModel.findOne({ action: AdministrativeEventActions.userClosed }).lean();
		expect(event).toMatchObject({
			actor_id: actor.id,
			target_user_id: target.id,
			action: AdministrativeEventActions.userClosed,
			before: { role: Roles.partner, status: 'suspended' },
			origin: 'api',
			reason,
		});
		expect(event?.after).toBeUndefined();
	});
});
