import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createUnit } from '../helpers/unit.helpers';

describe('Get Unit', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => MongoConnection.Instance.emptyCollection(UnitModel));
	it('gets a unit publicly', async () => {
		const { id } = await createUnit();
		const response = await request(app.server).get(`/units/${id}`);
		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(response.body).toMatchObject({ allow_decimal: true, kind: 'volume' });
	});
	it('rejects invalid and nonexistent ids', async () => {
		expect((await request(app.server).get('/units/invalid')).status).toBe(HTTP_STATUS.bad_request);
		expect((await request(app.server).get(`/units/${new ObjectId()}`)).status).toBe(HTTP_STATUS.bad_request);
	});
});
