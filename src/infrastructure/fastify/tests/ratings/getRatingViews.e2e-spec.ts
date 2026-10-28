import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { RatingModel } from '@/core/engagement/infra/mongo/entities/rating.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { createDrink } from '../helpers/drink.helpers';
import { createRatingRecord } from '../helpers/rating.helpers';

type RatingResponse = {
	id: string;
	drinkId: string;
	userId: string;
	value: number;
	createdAt: string;
	updatedAt: string;
};

describe('Rating read views', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(DrinkModel);
		await MongoConnection.Instance.emptyCollection(RatingModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('returns one rating, the actor rating, and the drink summary through HTTP', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.member });
		const { id: drinkId } = await createDrink();
		const { id } = await createRatingRecord({ drinkId, userId: user.id, value: 4 });

		const byId = await request(app.server).get(`/ratings/${id}`).send();
		const mine = await request(app.server).get(`/drinks/${drinkId}/ratings/me`).set('Cookie', cookies).send();
		const myRatings = await request(app.server).get('/me/ratings').set('Cookie', cookies).send();
		const summary = await request(app.server).get(`/drinks/${drinkId}/ratings/summary`).send();

		expect(byId.status).toBe(HTTP_STATUS.ok);
		expect(byId.body as RatingResponse).toMatchObject({ id, drinkId, userId: user.id, value: 4 });
		expect(byId.body).not.toHaveProperty('_id');
		expect(mine.status).toBe(HTTP_STATUS.ok);
		expect(mine.body as RatingResponse).toMatchObject({ id, drinkId, userId: user.id, value: 4 });
		expect(myRatings.status).toBe(HTTP_STATUS.ok);
		const myRatingsBody = myRatings.body as RatingResponse[];
		expect(myRatingsBody).toHaveLength(1);
		expect(myRatingsBody[0]).toMatchObject({ id, drinkId, userId: user.id, value: 4 });
		expect(summary.status).toBe(HTTP_STATUS.ok);
		expect(summary.body).toEqual({ average: 4, count: 1 });
	});
});
