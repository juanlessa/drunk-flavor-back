import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { Roles } from '@/shared/accessControl/roles';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { RatingModel } from '@/core/engagement/infra/mongo/entities/rating.model';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { createRatingRecord } from '../helpers/rating.helpers';

describe('Delete Rating', () => {
	beforeAll(async () => {
		await app.ready();
		await RatingModel.init();
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
		await MongoConnection.Instance.emptyCollection(RatingModel);
	});

	it('Should be able to delete an own rating as a member', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.member });
		const { id } = await createRatingRecord({ user_id: user.id, value: 4 });
		const response = await request(app.server).delete(`/ratings/${id}`).set('Cookie', cookies).send();
		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(await RatingModel.findById(id).lean()).toBeNull();
	});
});
