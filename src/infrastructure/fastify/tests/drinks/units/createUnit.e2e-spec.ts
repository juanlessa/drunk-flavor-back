import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { resolveUnitsRepository } from '@/core/drinks/infra/mongo/container';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createAndAuthenticateUser } from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';

describe('Create Unit', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('Should be able to create a unit', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const data = createUnitFactory();
		const response = await request(app.server).post('/units').set('Cookie', cookies).send(data);
		expect(response.status).toBe(HTTP_STATUS.created);
	});

	it('Should be able to create a unit that is written with the ingredient name', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const data = createUnitFactory({
			translations: {
				en: { name: 'unit', namePlural: 'units' },
				pt: { name: 'unidade', namePlural: 'unidades' },
			},
			kind: 'count',
			allowDecimal: false,
			useIngredientName: true,
		});
		const response = await request(app.server).post('/units').set('Cookie', cookies).send(data);
		expect(response.status).toBe(HTTP_STATUS.created);
		const saved = await resolveUnitsRepository().findByName(data.translations);
		expect(saved).toMatchObject({ kind: 'count', useIngredientName: true });
	});

	it.each([
		{ title: 'is not a count unit', unit: { kind: 'volume' } },
		{ title: 'has a symbol', unit: { kind: 'count', symbol: 'u' } },
	] as const)(
		'Should not be able to create a unit written with the ingredient name that $title',
		async ({ unit }) => {
			const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
			const data = createUnitFactory({ ...unit, useIngredientName: true });
			const response = await request(app.server).post('/units').set('Cookie', cookies).send(data);
			expect(response.status).toBe(HTTP_STATUS.bad_request);
		},
	);
});
