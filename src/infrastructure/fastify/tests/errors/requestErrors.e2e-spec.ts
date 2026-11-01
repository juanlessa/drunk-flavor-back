import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '@/infrastructure/fastify/app';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import en from '@/shared/locales/en.json';

type FieldErrorBody = { location: string; path: string; localeKey: keyof typeof en; message: string };
type ErrorBody = { ok: boolean; localeKey: keyof typeof en; message: string; errors: FieldErrorBody[] };

describe('Request errors', () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	it('returns every invalid field of a body with its location and path', async () => {
		const response = await request(app.server)
			.post('/signup')
			.send({ name: '', email: 'not-an-email', password: 'a' });

		const body = response.body as ErrorBody;

		expect(response.status).toBe(HTTP_STATUS.bad_request);
		expect(body.ok).toBe(false);
		expect(body.errors.length).toBeGreaterThan(1);
		expect(body.errors.map((error) => error.path)).toEqual(expect.arrayContaining(['name', 'email', 'password']));
		expect(body.localeKey).toBe('apiResponses.validation.failed');
		expect(body.message).toBe(en['apiResponses.validation.failed']);
	});

	it('only exposes catalog locale keys, never library default messages', async () => {
		const response = await request(app.server).get('/units?page=abc&limit=-1');

		const body = response.body as ErrorBody;

		expect(response.status).toBe(HTTP_STATUS.bad_request);
		expect(body.errors.length).toBeGreaterThan(0);
		for (const error of body.errors) {
			expect(error.location).toBe('querystring');
			expect(Object.keys(en)).toContain(error.localeKey);
			expect(error.message).toBe(en[error.localeKey]);
		}
		expect(Object.keys(en)).toContain(body.localeKey);
	});

	it('answers an empty JSON body with a translated error', async () => {
		const response = await request(app.server).post('/signup').set('Content-Type', 'application/json').send('');

		expect(response.status).toBe(HTTP_STATUS.bad_request);
		expect(response.body).toEqual({
			ok: false,
			code: 'BAD_REQUEST',
			localeKey: 'apiResponses.request.emptyBody',
			message: en['apiResponses.request.emptyBody'],
		});
	});

	it.each([
		['GET', '/does-not-exist'],
		['PUT', '/signup'],
	] as const)('answers an unknown route (%s %s) using the standard error contract', async (method, url) => {
		const response = await request(app.server)[method.toLowerCase() as 'get' | 'put'](url);

		expect(response.status).toBe(HTTP_STATUS.not_found);
		expect(response.body).toEqual({
			ok: false,
			code: 'NOT_FOUND',
			localeKey: 'apiResponses.request.routeNotFound',
			message: en['apiResponses.request.routeNotFound'],
		});
		expect(response.headers['content-language']).toBe('en');
		expect(response.headers.vary).toContain('Accept-Language');
	});
});
