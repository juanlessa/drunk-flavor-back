import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { app } from '@/infrastructure/fastify/app';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { DrinkModel } from '@/core/drinks/infra/mongo/entities/drink.model';
import { createDrink } from '../helpers/drink.helpers';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';

describe('Update Drink', () => {
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

	it('Should be able to update a drink', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: UserRolesEnum.admin });
		const { id, ingredient_id } = await createDrink();

		const { translations } = createDrinkFactory({
			translations: {
				en: { name: 'cosmopolitan', method: 'preparation mode' },
				pt: { name: 'cosmopolitan', method: 'modo de preparo' },
			},
		});
		const ingredients = [{ ingredient_id, quantity: 60 }];

		const response = await request(app.server)
			.patch('/drinks')
			.set('Cookie', cookies)
			.send({ id, translations, ingredients });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
