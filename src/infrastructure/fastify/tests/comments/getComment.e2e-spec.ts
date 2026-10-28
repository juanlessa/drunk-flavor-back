import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { CommentModel } from '@/core/engagement/infra/mongo/entities/comment.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createCommentRecord } from '../helpers/comment.helpers';
import { createDrink } from '../helpers/drink.helpers';

describe('Get Comment', () => {
	beforeAll(async () => {
		await app.ready();
		await CommentModel.init();
	});
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(DrinkModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
		await MongoConnection.Instance.emptyCollection(CommentModel);
	});

	it('Should be able to get a visible comment', async () => {
		const { id: drinkId } = await createDrink();
		const { id } = await createCommentRecord({ drinkId, content: 'visible comment' });

		const response = await request(app.server).get(`/comments/${id}`).send();

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(response.body).toMatchObject({ id, drinkId, content: 'visible comment', status: 'visible' });
	});
});
