import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';
import { createUnit } from '../helpers/unit.helpers';

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
			translations: {
				en: { name: ' GRAM ', namePlural: ' GRAMS ' },
				pt: { name: ' GRAMA ', namePlural: ' GRAMAS ' },
			},
			symbol: ' g ',
			spaceBeforeSymbol: false,
			allowDecimal: false,
			kind: 'mass',
		});
		expect(
			(
				await request(app.server)
					.patch('/units')
					.set('Cookie', cookies)
					.send({ id, ...data })
			).status,
		).toBe(HTTP_STATUS.no_content);
		expect(await UnitModel.findById(id).lean().exec()).toMatchObject({
			translations: { en: { name: 'gram', name_plural: 'grams' } },
			symbol: 'g',
			space_before_symbol: false,
			allow_decimal: false,
			kind: 'mass',
		});
	});

	it('Should be able to remove the symbol of a unit by sending null', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id } = await createUnit();
		await UnitModel.updateOne({ _id: id }, { $set: { symbol: 'ml' } }).exec();

		const response = await request(app.server)
			.patch('/units')
			.set('Cookie', cookies)
			.send({ id, ...createUnitFactory(), symbol: null });

		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(await UnitModel.findById(id).lean().exec()).not.toHaveProperty('symbol');
	});

	it('Should reject an empty symbol', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id } = await createUnit();

		const response = await request(app.server)
			.patch('/units')
			.set('Cookie', cookies)
			.send({ id, ...createUnitFactory(), symbol: '' });

		expect(response.status).toBe(HTTP_STATUS.bad_request);
	});
});
