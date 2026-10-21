import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { Roles } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { ObjectId } from 'mongodb';
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
	it('updates a unit with normalized complete data', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const { id } = await createUnit();
		const data = createUnitFactory({
			translations: {
				en: { name: ' GRAM ', name_plural: ' GRAMS ' },
				pt: { name: ' GRAMA ', name_plural: ' GRAMAS ' },
			},
			symbol: ' g ',
			space_before_symbol: false,
			allow_decimal: false,
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
	it.each([
		['missing', undefined],
		['malformed', 'invalid-id'],
		['nonexistent', new ObjectId().toString()],
	] as const)('rejects a %s unit ID', async (_, id) => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const response = await request(app.server)
			.patch('/units')
			.set('Cookie', cookies)
			.send({ ...(id === undefined ? {} : { id }), ...createUnitFactory() });
		expect(response.status).toBe(HTTP_STATUS.bad_request);
	});
	it.each([
		['anonymous', undefined, HTTP_STATUS.unauthorized],
		['member', Roles.member, HTTP_STATUS.forbidden],
		['partner', Roles.partner, HTTP_STATUS.no_content],
	] as const)('enforces update access for %s', async (_, role, status) => {
		const { id } = await createUnit();
		const cookies = role
			? (await createAndAuthenticateUser(app, { email: `${role}@update.example.com`, role })).cookies
			: undefined;
		const call = request(app.server).patch('/units');
		if (cookies) call.set('Cookie', cookies);
		expect((await call.send({ id, ...createUnitFactory() })).status).toBe(status);
	});
});
