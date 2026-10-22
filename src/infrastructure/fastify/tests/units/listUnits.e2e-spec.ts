import { UnitModel } from '@/core/drinks/infra/mongo/entities/unit.model';
import { app } from '@/infrastructure/fastify/app';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createUnit } from '../helpers/unit.helpers';

describe('List Units', () => {
	beforeAll(async () => app.ready());
	afterAll(async () => app.close());
	beforeEach(async () => {
		await MongoConnection.Instance.emptyCollection(UnitModel);
		await createUnit({
			translations: { en: { name: 'cup', name_plural: 'cups' }, pt: { name: 'xícara', name_plural: 'xícaras' } },
		});
		await createUnit({
			translations: { en: { name: 'gram', name_plural: 'grams' }, pt: { name: 'grama', name_plural: 'gramas' } },
			kind: 'mass',
		});
		await createUnit({
			translations: {
				en: { name: 'piece', name_plural: 'pieces' },
				pt: { name: 'unidade', name_plural: 'unidades' },
			},
			kind: 'count',
		});
	});
	it('Should be able to list the units', async () => {
		const response = await request(app.server).get('/units').query({ page: 2, limit: 2 });
		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(response.body).toHaveLength(1);
	});
});
