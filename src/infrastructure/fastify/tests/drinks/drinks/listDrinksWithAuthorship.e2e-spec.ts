import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createAndAuthenticateUser } from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';
import { createDrink } from '@/infrastructure/fastify/tests/drinks/helpers/drink.helpers';

describe('List Drinks With Authorship', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(DrinkModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('shows who created and last edited each drink', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.partner });
		await createDrink({ createdBy: user.id });

		const response = await request(app.server).get('/drinks/me').set('Cookie', cookies);

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(response.body).toMatchObject([{ createdBy: user.id, updatedBy: user.id }]);
	});

	it('hides who created and last edited a drink from the public reads', async () => {
		const { id } = await createDrink();

		const list = await request(app.server).get('/drinks');
		const single = await request(app.server).get(`/drinks/${id}`);

		const [drink] = list.body as object[];
		expect(drink).not.toHaveProperty('createdBy');
		expect(drink).not.toHaveProperty('updatedBy');
		expect(single.body).not.toHaveProperty('createdBy');
		expect(single.body).not.toHaveProperty('updatedBy');
	});
});
