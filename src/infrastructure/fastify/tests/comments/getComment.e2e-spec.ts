import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { CommentModel } from '@/core/engagement/infra/mongo/entities/comment.model';
import { CommentStatuses } from '@/core/engagement/entities/comment.entity';
import { createDrink } from '../helpers/drink.helpers';
import { createCommentRecord } from '../helpers/comment.helpers';

describe('Get Comment', () => {
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

	it('Should not be able to get a non-visible comment on public reads', async () => {
		const { id: drinkId } = await createDrink();
		await createCommentRecord({ drinkId, content: 'visible one' });
		const { id: hiddenId } = await createCommentRecord({
			drinkId,
			content: 'hidden one',
			status: CommentStatuses.hidden,
		});

		const get = await request(app.server).get(`/comments/${hiddenId}`).send();
		expect(get.status).toBe(HTTP_STATUS.bad_request);
	});
});
