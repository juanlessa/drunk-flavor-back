import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RolesEnum } from '@/shared/accessControl/roles';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createAndAuthenticateUser } from '../helpers/authentication.helpers';

describe('Create Unit', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('creates and persists a normalized unit in the units collection', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });
		const data = createUnitFactory({
			translations: {
				en: { name: '  MILLILITER ', name_plural: ' MILLILITERS ' },
				pt: { name: ' MILILITRO ', name_plural: ' MILILITROS ' },
			},
			symbol: ' mL ',
			space_before_symbol: false,
			allow_decimal: false,
		});
		const response = await request(app.server).post('/units').set('Cookie', cookies).send(data);
		expect(response.status).toBe(HTTP_STATUS.created);
		const unit = await UnitModel.findOne().lean().exec();
		expect(UnitModel.collection.collectionName).toBe('units');
		expect(unit?.translations.en).toMatchObject({ name: 'milliliter', name_plural: 'milliliters' });
		expect(unit).toMatchObject({ symbol: 'mL', space_before_symbol: false, allow_decimal: false });
	});

	it('persists optional fields as omitted', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });
		expect((await request(app.server).post('/units').set('Cookie', cookies).send(createUnitFactory())).status).toBe(
			HTTP_STATUS.created,
		);
		const unit = await UnitModel.findOne().lean().exec();
		expect(unit).not.toHaveProperty('symbol');
		expect(unit).not.toHaveProperty('space_before_symbol');
	});

	it.each([
		['English', { en: { name: 'milliliter' }, pt: { name: 'unidade portuguesa exclusiva' } }],
		['Portuguese', { en: { name: 'unique english unit' }, pt: { name: 'mililitro' } }],
	] as const)('rejects a duplicate name in %s only', async (_, translations) => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });
		await request(app.server).post('/units').set('Cookie', cookies).send(createUnitFactory());
		const response = await request(app.server)
			.post('/units')
			.set('Cookie', cookies)
			.send(createUnitFactory({ translations }));
		expect(response.status).toBe(HTTP_STATUS.bad_request);
	});

	it('rejects invalid kinds and missing required fields', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });
		const data = createUnitFactory();
		const invalidKind = await request(app.server)
			.post('/units')
			.set('Cookie', cookies)
			.send({ ...data, kind: 'length' });
		expect(invalidKind.status).toBe(HTTP_STATUS.bad_request);
		const missingRequiredField = await request(app.server)
			.post('/units')
			.set('Cookie', cookies)
			.send({ translations: data.translations, kind: data.kind });
		expect(missingRequiredField.status).toBe(HTTP_STATUS.bad_request);
	});

	it.each([
		['anonymous', undefined, HTTP_STATUS.unauthorized],
		['member', RolesEnum.member, HTTP_STATUS.forbidden],
		['partner', RolesEnum.partner, HTTP_STATUS.created],
	] as const)('enforces create access for %s', async (_, role, status) => {
		const cookies = role
			? (await createAndAuthenticateUser(app, { email: `${role}@example.com`, role })).cookies
			: undefined;
		const call = request(app.server).post('/units');
		if (cookies) call.set('Cookie', cookies);
		expect((await call.send(createUnitFactory())).status).toBe(status);
	});
});
