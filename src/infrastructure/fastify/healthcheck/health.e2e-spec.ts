import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { type ReadinessReport } from '@/infrastructure/fastify/healthcheck/health.schema';

describe('Health Check', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	it('Should return 200 and status ok on the liveness probe', async () => {
		const response = await request(app.server).get('/health/live').send();

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(response.body).toEqual({ status: 'ok' });
	});

	it('Should return 200 and all dependencies up on the readiness probe', async () => {
		const response = await request(app.server).get('/health/ready').send();
		const body = response.body as ReadinessReport;

		expect(response.status).toBe(HTTP_STATUS.ok);
		expect(body.status).toBe('ok');
		expect(body.dependencies).toEqual({ mongo: 'up', redis: 'up', bullmq: 'up' });
	});

	it('Should not leak internal details on the readiness probe', async () => {
		const response = await request(app.server).get('/health/ready').send();
		const body = response.body as ReadinessReport;

		expect(Object.keys(body).sort()).toEqual(['dependencies', 'status']);
	});
});
