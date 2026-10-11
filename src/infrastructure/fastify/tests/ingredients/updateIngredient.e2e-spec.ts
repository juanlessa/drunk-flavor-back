import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { createIngredient } from '../helpers/ingredient.helpers';
import { RolesEnum } from '@/shared/accessControl/roles';

describe('Update Ingredient', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('Should be able to update an ingredient', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });
		const { id, category_id } = await createIngredient();

		const { translations, is_alcoholic } = createIngredientFactory({
			translations: {
				en: { name: 'Lime juice', unit: 'ml', unit_plural: 'ml' },
				pt: { name: 'Suco de limão', unit: 'ml', unit_plural: 'ml' },
			},
			is_alcoholic: true,
		});

		const response = await request(app.server)
			.patch('/ingredients')
			.set('Cookie', cookies)
			.send({ id, translations, is_alcoholic, category_id });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
