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
			translations: { en: { name: 'cup', namePlural: 'cups' }, pt: { name: 'xícara', namePlural: 'xícaras' } },
		});
		await createUnit({
			translations: { en: { name: 'gram', namePlural: 'grams' }, pt: { name: 'grama', namePlural: 'gramas' } },
			kind: 'mass',
		});
		await createUnit({
			translations: {
				en: { name: 'piece', namePlural: 'pieces' },
				pt: { name: 'unidade', namePlural: 'unidades' },
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
