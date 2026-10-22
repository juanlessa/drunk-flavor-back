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

describe('Create Unit', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});

	it('Should be able to create a unit', async () => {
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
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
});
