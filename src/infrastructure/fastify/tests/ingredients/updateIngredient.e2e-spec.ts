import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { createIngredient } from '../helpers/ingredient.helpers';

describe('Update Ingredient', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('Should be able to update an ingredient', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id, categoryId, unitId } = await createIngredient();
		const { translations } = createIngredientFactory({
			translations: {
				en: { name: 'Lime juice' },
				pt: { name: 'Suco de limão' },
			},
		});

		const response = await request(app.server)
			.patch('/ingredients')
			.set('Cookie', cookies)
			.send({ id, translations, categoryId, unitId });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
