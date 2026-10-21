import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { UserModel } from '@/core/accounts/infra/mongo/entities/user.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RolesEnum } from '@/shared/accessControl/roles';
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
	it('removes the unit from MongoDB', async () => {
		const { id } = await createUnit();
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });
		const response = await request(app.server).delete('/units').set('Cookie', cookies).send({ id });
		expect(response.status).toBe(HTTP_STATUS.no_content);
		expect(await UnitModel.findById(id).lean().exec()).toBeNull();
	});
	it.each([
		['missing', undefined],
		['malformed', 'invalid-id'],
		['nonexistent', new ObjectId().toString()],
	] as const)('rejects a %s unit ID', async (_, id) => {
		const { cookies } = await createAndAuthenticateUser(app, { role: RolesEnum.admin });
		const response = await request(app.server)
			.delete('/units')
			.set('Cookie', cookies)
			.send(id === undefined ? {} : { id });
		expect(response.status).toBe(HTTP_STATUS.bad_request);
	});
	it.each([
		['admin', RolesEnum.admin, HTTP_STATUS.no_content],
		['partner', RolesEnum.partner, HTTP_STATUS.no_content],
		['member', RolesEnum.member, HTTP_STATUS.forbidden],
	] as const)('enforces delete access for %s', async (_, role, status) => {
		const { id } = await createUnit();
		const { cookies } = await createAndAuthenticateUser(app, { email: `${role}@delete.example.com`, role });
		expect((await request(app.server).delete('/units').set('Cookie', cookies).send({ id })).status).toBe(status);
	});
	it('rejects unauthenticated deletion', async () => {
		const { id } = await createUnit();
		expect((await request(app.server).delete('/units').send({ id })).status).toBe(HTTP_STATUS.unauthorized);
	});
});
