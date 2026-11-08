import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createAndAuthenticateUser } from '@/infrastructure/fastify/tests/accounts/helpers/authentication.helpers';
import { createUnit } from '@/infrastructure/fastify/tests/drinks/helpers/unit.helpers';

describe('Update Unit', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('Should be able to update a unit', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id } = await createUnit();
		const data = createUnitFactory({
			translations: { en: { name: 'gram', namePlural: 'grams' }, pt: { name: 'grama', namePlural: 'gramas' } },
			symbol: 'g',
			kind: 'mass',
		});

		const response = await request(app.server)
			.patch('/units')
			.set('Cookie', cookies)
			.send({ id, ...data });

		expect(response.status).toBe(HTTP_STATUS.no_content);
	});

	it('Should be able to turn a count unit into one written with the ingredient name', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id } = await createUnit({ kind: 'count', allowDecimal: false });
		const data = createUnitFactory({ kind: 'count', allowDecimal: false, useIngredientName: true });
		const response = await request(app.server)
			.patch('/units')
			.set('Cookie', cookies)
			.send({ id, ...data });
		expect(response.status).toBe(HTTP_STATUS.no_content);
		const saved = await request(app.server).get(`/units/${id}`);
		expect(saved.body).toMatchObject({ useIngredientName: true });
	});

	it('Should not be able to give a symbol to a unit written with the ingredient name', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id } = await createUnit({ kind: 'count', allowDecimal: false, useIngredientName: true });
		const data = createUnitFactory({ kind: 'count', allowDecimal: false, symbol: 'u' });
		const response = await request(app.server)
			.patch('/units')
			.set('Cookie', cookies)
			.send({ id, ...data });
		expect(response.status).toBe(HTTP_STATUS.bad_request);
	});
});
