import fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { afterEach, describe, expect, it } from 'vitest';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { I18N_OPTIONS } from '@/infrastructure/fastify/constants/i18n.constants';
import { errorHandler } from '@/infrastructure/fastify/middlewares/errorHandler';
import { notFoundHandler } from '@/infrastructure/fastify/middlewares/notFoundHandler';
import { i18nPlugin } from '@/infrastructure/i18n/i18n.plugin';
import { i18n } from '@/infrastructure/i18n';
import { handleFastifyError } from './fastifyError';

const createFastifyError = (overrides: Partial<FastifyError> & Pick<FastifyError, 'code'>): FastifyError =>
	Object.assign(new Error('English free text from the library'), { name: 'FastifyError' }, overrides) as FastifyError;

describe('handleFastifyError', () => {
	describe('validation errors', () => {
		it('returns every issue with its location and dot-separated path', () => {
			const error = createFastifyError({
				code: 'FST_ERR_VALIDATION',
				statusCode: 400,
				validationContext: 'body',
				validation: [
					{
						instancePath: '/name',
						message: 'apiResponses.users.requiredName',
						keyword: 'invalid_type',
						params: {},
						schemaPath: '',
					},
					{
						instancePath: '/address/0/street',
						message: 'apiResponses.users.requiredEmail',
						keyword: 'invalid_type',
						params: {},
						schemaPath: '',
					},
				],
			});

			expect(handleFastifyError(error)).toEqual({
				statusCode: HTTP_STATUS.bad_request,
				localeKey: 'apiResponses.validation.failed',
				errors: [
					{ location: 'body', path: 'name', localeKey: 'apiResponses.users.requiredName' },
					{ location: 'body', path: 'address.0.street', localeKey: 'apiResponses.users.requiredEmail' },
				],
			});
		});

		it.each([
			['a minimum', { minimum: 8, inclusive: true, origin: 'string' }, { min: 8 }],
			['a maximum', { maximum: 64 }, { max: 64 }],
			['both limits', { minimum: 1, maximum: 5 }, { min: 1, max: 5 }],
		])('exposes %s as params', (_name, issueParams, expected) => {
			const error = createFastifyError({
				code: 'FST_ERR_VALIDATION',
				validationContext: 'body',
				validation: [
					{
						instancePath: '/password',
						message: 'apiResponses.users.invalidPasswordMinSize',
						keyword: 'too_small',
						params: issueParams,
						schemaPath: '',
					},
				],
			});

			expect(handleFastifyError(error).errors?.[0].params).toEqual(expected);
		});

		it('omits params when the issue has no numeric limit', () => {
			const error = createFastifyError({
				code: 'FST_ERR_VALIDATION',
				validationContext: 'body',
				validation: [
					{
						instancePath: '/name',
						message: 'apiResponses.users.requiredName',
						keyword: 'invalid_type',
						params: { expected: 'string', minimum: 'not-a-number' },
						schemaPath: '',
					},
				],
			});

			expect(handleFastifyError(error).errors?.[0]).not.toHaveProperty('params');
		});

		it('uses an empty path when the whole request part is invalid', () => {
			const error = createFastifyError({
				code: 'FST_ERR_VALIDATION',
				validationContext: 'body',
				validation: [
					{
						instancePath: '/',
						message: 'apiResponses.users.requiredName',
						keyword: 'invalid_type',
						params: {},
						schemaPath: '',
					},
				],
			});

			expect(handleFastifyError(error).errors).toEqual([
				{ location: 'body', path: '', localeKey: 'apiResponses.users.requiredName' },
			]);
		});

		it('replaces library default messages with a generic key instead of leaking English text', () => {
			const error = createFastifyError({
				code: 'FST_ERR_VALIDATION',
				validationContext: 'querystring',
				validation: [
					{
						instancePath: '/page',
						message: 'Too small: expected number to be >=1',
						keyword: 'too_small',
						params: {},
						schemaPath: '',
					},
				],
			});

			expect(handleFastifyError(error)).toEqual({
				statusCode: HTTP_STATUS.bad_request,
				localeKey: 'apiResponses.validation.failed',
				errors: [{ location: 'querystring', path: 'page', localeKey: 'apiResponses.validation.invalidValue' }],
			});
		});
	});

	describe('errors without validation details', () => {
		it.each([
			['FST_ERR_CTP_EMPTY_JSON_BODY', 400, 'apiResponses.request.emptyBody'],
			['FST_ERR_CTP_INVALID_JSON_BODY', 400, 'apiResponses.request.invalidJson'],
			['FST_ERR_CTP_BODY_TOO_LARGE', 413, 'apiResponses.request.bodyTooLarge'],
			['FST_ERR_CTP_INVALID_MEDIA_TYPE', 415, 'apiResponses.request.unsupportedMediaType'],
			['FST_REQ_FILE_TOO_LARGE', 413, 'apiResponses.request.fileTooLarge'],
			['FST_FILES_LIMIT', 413, 'apiResponses.request.tooManyParts'],
			['FST_INVALID_MULTIPART_CONTENT_TYPE', 406, 'apiResponses.request.invalidMultipart'],
		] as const)('maps %s to a locale key and keeps its status', (code, statusCode, localeKey) => {
			expect(handleFastifyError(createFastifyError({ code, statusCode }))).toEqual({ statusCode, localeKey });
		});

		it('keeps a locale key carried as the message, as configured for @fastify/jwt', () => {
			const error = createFastifyError({
				code: 'FST_JWT_NO_AUTHORIZATION_IN_HEADER',
				statusCode: 401,
				message: 'apiResponses.auth.noAuthorizationInHeaderMessage',
			});

			expect(handleFastifyError(error)).toEqual({
				statusCode: 401,
				localeKey: 'apiResponses.auth.noAuthorizationInHeaderMessage',
			});
		});

		it('prefers the code mapping over the message', () => {
			const error = createFastifyError({
				code: 'FST_ERR_CTP_EMPTY_JSON_BODY',
				statusCode: 400,
				message: 'apiResponses.auth.invalidCredentials',
			});

			expect(handleFastifyError(error).localeKey).toBe('apiResponses.request.emptyBody');
		});

		it('uses the generic request key for unmapped client errors without leaking the message', () => {
			const response = handleFastifyError(createFastifyError({ code: 'FST_ERR_SOMETHING_NEW', statusCode: 418 }));

			expect(response).toEqual({ statusCode: 418, localeKey: 'apiResponses.request.invalid' });
		});

		it('uses the internal server error key for unmapped server errors', () => {
			const response = handleFastifyError(createFastifyError({ code: 'FST_ERR_SOMETHING_NEW', statusCode: 503 }));

			expect(response).toEqual({ statusCode: 503, localeKey: 'apiResponses.internalServerError' });
		});

		it('treats a missing status code as an internal server error', () => {
			const response = handleFastifyError(createFastifyError({ code: 'FST_ERR_SOMETHING_NEW' }));

			expect(response).toEqual({
				statusCode: HTTP_STATUS.internal_server_error,
				localeKey: 'apiResponses.internalServerError',
			});
		});
	});
});

describe('Fastify errors through the error handler', () => {
	let app: FastifyInstance;

	const buildApp = async () => {
		app = fastify({ bodyLimit: 64 });
		app.setValidatorCompiler(validatorCompiler);
		app.setSerializerCompiler(serializerCompiler);
		app.register(i18nPlugin, I18N_OPTIONS);
		app.register(fastifyMultipart, { limits: { files: 1, fileSize: 10 } });
		app.setErrorHandler(errorHandler);
		app.setNotFoundHandler(notFoundHandler);

		app.post(
			'/items',
			{
				schema: {
					body: z.object({
						name: z
							.string({ error: 'apiResponses.users.requiredName' })
							.min(1, { error: 'apiResponses.users.invalidNameFormat' }),
						age: z.number(),
						address: z.object({ street: z.string({ error: 'apiResponses.users.requiredSurname' }) }),
						tags: z.array(z.string({ error: 'apiResponses.users.requiredId' })),
					}),
				},
			},
			async () => ({ ok: true }),
		);
		app.post(
			'/signup',
			{
				schema: {
					body: z.object({
						password: z
							.string({ error: 'apiResponses.users.requiredPassword' })
							.min(8, { error: 'apiResponses.users.invalidPasswordMinSize' }),
					}),
				},
			},
			async () => ({ ok: true }),
		);
		app.get('/list', { schema: { querystring: z.object({ page: z.coerce.number().min(1) }) } }, async () => ({
			ok: true,
		}));
		app.post('/upload', async (request) => {
			const file = await request.file();
			await file?.toBuffer();
			return { ok: true };
		});

		await app.ready();
	};

	afterEach(async () => {
		await app.close();
	});

	it('returns every invalid field, each translated and located', async () => {
		await buildApp();

		const response = await app.inject({
			method: 'POST',
			url: '/items',
			payload: { name: '', age: 'x', address: {}, tags: ['a', 1] },
		});

		expect(response.statusCode).toBe(HTTP_STATUS.bad_request);
		expect(response.json()).toEqual({
			ok: false,
			code: 'VALIDATION_FAILED',
			localeKey: 'apiResponses.validation.failed',
			message: i18n.translate('en', 'apiResponses.validation.failed'),
			errors: [
				{
					location: 'body',
					path: 'name',
					localeKey: 'apiResponses.users.invalidNameFormat',
					params: { min: 1 },
					message: i18n.translate('en', 'apiResponses.users.invalidNameFormat'),
				},
				{
					location: 'body',
					path: 'age',
					localeKey: 'apiResponses.validation.invalidValue',
					message: i18n.translate('en', 'apiResponses.validation.invalidValue'),
				},
				{
					location: 'body',
					path: 'address.street',
					localeKey: 'apiResponses.users.requiredSurname',
					message: i18n.translate('en', 'apiResponses.users.requiredSurname'),
				},
				{
					location: 'body',
					path: 'tags.1',
					localeKey: 'apiResponses.users.requiredId',
					message: i18n.translate('en', 'apiResponses.users.requiredId'),
				},
			],
		});
	});

	it.each([
		['en', 'Password must have a minimum of 8 characters'],
		['pt-BR', 'A senha deve ter no mínimo 8 caracteres'],
	])('interpolates the rule limit into the message for "%s"', async (language, message) => {
		await buildApp();

		const response = await app.inject({
			method: 'POST',
			url: '/signup',
			headers: { 'accept-language': language },
			payload: { password: 'short' },
		});

		expect(response.json<{ errors: unknown[] }>().errors).toEqual([
			{
				location: 'body',
				path: 'password',
				localeKey: 'apiResponses.users.invalidPasswordMinSize',
				params: { min: 8 },
				message,
			},
		]);
	});

	it.each([
		['an unknown route', 'GET', '/does-not-exist'],
		['an unsupported method', 'PUT', '/items'],
	])('answers %s with the standard error contract', async (_name, method, url) => {
		await buildApp();

		const response = await app.inject({ method: method as 'GET' | 'PUT', url });

		expect(response.statusCode).toBe(HTTP_STATUS.not_found);
		expect(response.json()).toEqual({
			ok: false,
			code: 'NOT_FOUND',
			localeKey: 'apiResponses.request.routeNotFound',
			message: i18n.translate('en', 'apiResponses.request.routeNotFound'),
		});
	});

	it('reports the failing request part for query validation', async () => {
		await buildApp();

		const response = await app.inject({ method: 'GET', url: '/list?page=0' });

		expect(response.statusCode).toBe(HTTP_STATUS.bad_request);
		expect(response.json<{ errors: unknown[] }>().errors).toEqual([
			{
				location: 'querystring',
				path: 'page',
				localeKey: 'apiResponses.validation.invalidValue',
				params: { min: 1 },
				message: i18n.translate('en', 'apiResponses.validation.invalidValue'),
			},
		]);
	});

	it.each([
		['an empty JSON body', '', 400, 'apiResponses.request.emptyBody'],
		['malformed JSON', '{', 400, 'apiResponses.request.invalidJson'],
		['a body above the limit', JSON.stringify({ a: 'x'.repeat(100) }), 413, 'apiResponses.request.bodyTooLarge'],
	] as const)('translates %s without a field list', async (_name, payload, statusCode, localeKey) => {
		await buildApp();

		const response = await app.inject({
			method: 'POST',
			url: '/items',
			headers: { 'content-type': 'application/json' },
			payload,
		});

		expect(response.statusCode).toBe(statusCode);
		expect(response.json()).toEqual({
			ok: false,
			code: 'BAD_REQUEST',
			localeKey,
			message: i18n.translate('en', localeKey),
		});
	});

	it('translates an uploaded file above the size limit', async () => {
		await buildApp();
		const boundary = 'test-boundary';
		const payload =
			`--${boundary}\r\n` +
			'Content-Disposition: form-data; name="file"; filename="a.png"\r\n' +
			'Content-Type: image/png\r\n\r\n' +
			`${'x'.repeat(100)}\r\n--${boundary}--\r\n`;

		const response = await app.inject({
			method: 'POST',
			url: '/upload',
			headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
			payload,
		});

		expect(response.statusCode).toBe(413);
		expect(response.json()).toEqual({
			ok: false,
			code: 'BAD_REQUEST',
			localeKey: 'apiResponses.request.fileTooLarge',
			message: i18n.translate('en', 'apiResponses.request.fileTooLarge'),
		});
	});
});
