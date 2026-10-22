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

describe('Delete Unit', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await MongoConnection.Instance.emptyCollection(UserModel);
	});
	it('Should be able to delete a unit', async () => {
		const { id } = await createUnit();
		const { cookies } = await createAndAuthenticateUser(app, { role: Roles.admin });
		const response = await request(app.server).delete('/units').set('Cookie', cookies).send({ id });
		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(await UnitModel.findById(id).lean().exec()).toBeNull();
	});
});
