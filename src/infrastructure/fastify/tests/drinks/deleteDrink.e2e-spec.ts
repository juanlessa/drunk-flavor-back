import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { createDrink } from '../helpers/drink.helpers';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { RolesEnum } from '@/shared/accessControl/roles';

describe('Delete Drink', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(CategoryModel);
		await MongoRepository.Instance.emptyCollection(IngredientModel);
		await MongoRepository.Instance.emptyCollection(DrinkModel);
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to delete a drink', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });
		const { id } = await createDrink();

		const response = await request(app.server).delete('/drinks').set('Cookie', cookies).send({ id });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
