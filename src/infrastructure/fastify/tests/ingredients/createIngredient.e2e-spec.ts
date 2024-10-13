import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserRolesEnum } from '@/core/accounts/entities/user.entity';
import { app } from '@/infrastructure/fastify/app';
import { MongoRepository } from '@/infrastructure/mongo/Mongo.repository';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { createIngredientFactory } from '@/core/drinks/container';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { createCategory } from '../helpers/category.helpers';

describe('Create Ingredient', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoRepository.Instance.emptyCollection(CategoryModel);
		await MongoRepository.Instance.emptyCollection(IngredientModel);
		await MongoRepository.Instance.emptyCollection(UserModel);
	});

	it('Should be able to create a category', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: UserRolesEnum.admin });
		const { id: category_id } = await createCategory();

		const { translations, is_alcoholic } = createIngredientFactory();

		const response = await request(app.server)
			.post('/ingredients')
			.set('Cookie', cookies)
			.send({ translations, is_alcoholic, category_id });

		expect(response.status).toBe(HTTP_STATUS.created);
	});
});