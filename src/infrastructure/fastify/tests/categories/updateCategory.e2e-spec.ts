import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { createCategory } from '../helpers/category.helpers';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { Roles } from '@/shared/accessControl/roles';

describe('Update Category', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('Should be able to update a category', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id } = await createCategory();

		const { translations, isAlcoholic } = createCategoryFactory({
			translations: { en: { name: 'Juice' }, pt: { name: 'Suco' } },
			isAlcoholic: true,
		});

		const response = await request(app.server)
			.patch('/categories')
			.set('Cookie', cookies)
			.send({ id, translations, isAlcoholic });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});
});
