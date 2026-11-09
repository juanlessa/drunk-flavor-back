import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { CategoryModel } from '@/core/drinks/infra/mongo/entities/category.model';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { IngredientModel } from '@/core/drinks/infra/mongo/entities/ingredient.model';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { createAndAuthenticateUser } from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';
import { createCategory } from '@/infrastructure/fastify/tests/drinks/helpers/category.helpers';
import { createUnit } from '@/infrastructure/fastify/tests/drinks/helpers/unit.helpers';

describe('Create Ingredient', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(CategoryModel);
		await MongoConnection.Instance.emptyCollection(IngredientModel);
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('Should be able to create an ingredient', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id: categoryId } = await createCategory();
		const { id: unitId } = await createUnit();
		const { translations } = createIngredientFactory();

		const response = await request(app.server)
			.post('/ingredients')
			.set('Cookie', cookies)
			.send({ translations, categoryId, unitIds: [unitId] });

		expect(response.status).toBe(HTTP_STATUS.created);
	});

	describe('with a unit written with the ingredient name', () => {
		const names = (enPlural?: string, ptPlural?: string) =>
			createIngredientFactory({
				translations: {
					en: { name: 'Lime', ...(enPlural && { namePlural: enPlural }) },
					pt: { name: 'Limão', ...(ptPlural && { namePlural: ptPlural }) },
				},
			}).translations;
		const createUnits = async () => {
			const { id: eachId } = await createUnit({
				translations: {
					en: { name: 'unit', namePlural: 'units' },
					pt: { name: 'unidade', namePlural: 'unidades' },
				},
				kind: 'count',
				allowDecimal: false,
				useIngredientName: true,
			});
			const { id: wedgeId } = await createUnit({
				translations: {
					en: { name: 'wedge', namePlural: 'wedges' },
					pt: { name: 'gomo', namePlural: 'gomos' },
				},
				kind: 'count',
				allowDecimal: false,
			});
			return { eachId, wedgeId };
		};

		it('Should be able to create an ingredient with the plural names, next to another unit', async () => {
			const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
			const { id: categoryId } = await createCategory();
			const { eachId, wedgeId } = await createUnits();

			const translations = names('limes', 'limões');
			const response = await request(app.server)
				.post('/ingredients')
				.set('Cookie', cookies)
				.send({ translations, categoryId, unitIds: [eachId, wedgeId] });

			expect(response.status).toBe(HTTP_STATUS.created);
			const saved = await resolveIngredientsRepository().findByName(translations);
			expect(saved?.translations.en.namePlural).toBe('Limes');
			expect(saved?.translations.pt.namePlural).toBe('Limões');
			expect(saved?.units.map(({ id }) => id)).toEqual([eachId, wedgeId]);
			expect(saved?.units[0]?.useIngredientName).toBe(true);
		});

		it('Should not be able to create an ingredient without the plural name', async () => {
			const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
			const { id: categoryId } = await createCategory();
			const { eachId } = await createUnits();

			const response = await request(app.server)
				.post('/ingredients')
				.set('Cookie', cookies)
				.send({ translations: names('limes'), categoryId, unitIds: [eachId] });

			expect(response.status).toBe(HTTP_STATUS.bad_request);
		});
	});
});
