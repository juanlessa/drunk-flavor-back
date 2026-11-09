import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createAndAuthenticateUser } from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';
import { createCategory } from '@/infrastructure/fastify/tests/drinks/helpers/category.helpers';

describe('List Categories With Authorship', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('lists the categories of the user first, showing who created and last edited each one', async () => {
		const { cookies, user } = await createAndAuthenticateUser(app, { role: Roles.partner });
		await createCategory({ translations: { en: { name: 'Apple' }, pt: { name: 'Maçã' } } });
		await createCategory({ createdBy: user.id, translations: { en: { name: 'Zest' }, pt: { name: 'Raspa' } } });

		const response = await request(app.server).get('/categories/me').set('Cookie', cookies);

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(response.body).toMatchObject([
			{ translations: { en: { name: 'Zest' } }, createdBy: user.id, updatedBy: user.id },
			{ translations: { en: { name: 'Apple' } }, createdBy: expect.any(String) as string },
		]);
	});

	it('hides who created and last edited a category from the public listing', async () => {
		await createCategory();

		const response = await request(app.server).get('/categories');

		const [category] = response.body as object[];
		expect(category).not.toHaveProperty('createdBy');
		expect(category).not.toHaveProperty('updatedBy');
	});
});
