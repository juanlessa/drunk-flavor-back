import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { ObjectId } from 'mongodb';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Roles } from '@/shared/accessControl/roles';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { CommentModel } from '@/core/engagement/infra/mongo/entities/comment.model';
import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { createDrink } from '../helpers/drink.helpers';

describe('Create Comment', () => {
	beforeAll(async () => {
		await app.ready();
		await CommentModel.init();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(DrinkModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(CommentModel);
	});

	it('Should be able to create a comment', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.member });
		const { id: drinkId } = await createDrink();

		const response = await request(app.server)
			.post('/comments')
			.set('Cookie', cookies)
			.send({ drinkId, content: '  Mixed CASE  ' });

		expect(response.status).toBe(HTTP_STATUS.created);
		const body = response.body as { id: string };
		const stored = await CommentModel.findById(body.id).lean();
		expect(stored?.user_id).toBe(user.id);
		expect(stored?.content).toBe('Mixed CASE');
		expect(stored?.status).toBe(CommentStatuses.visible);
	});
});
