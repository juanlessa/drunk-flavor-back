import fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { afterEach, describe, expect, it } from 'vitest';
import { NotFoundError } from '@/shared/error/error.lib';
import { errorHandler } from '@/infrastructure/fastify/middlewares/errorHandler';
import en from '@/shared/locales/en.json';
import { I18N_OPTIONS } from '@/infrastructure/fastify/constants/i18n.constants';
import { createI18n } from './i18n.lib';
import { i18nPlugin } from './i18n.plugin';

const i18n = createI18n({
	catalogs: { en: { greeting: 'Hello' }, pt: { greeting: 'Olá' } },
	defaultLocale: 'en',
});

const build = async () => {
	const app = fastify();
	app.register(i18nPlugin, { defaultLocale: i18n.defaultLocale, supportedLocales: i18n.supportedLocales });
	app.get('/greeting', async (request) => {
		// Simulates async work (database, hashing) so concurrent requests interleave before translating.
		await new Promise((resolve) => setTimeout(resolve, 20));
		return { locale: request.locale, message: i18n.translate(request.locale, 'greeting') };
	});
	await app.ready();
	return app;
};

describe('i18nPlugin', () => {
	let app: FastifyInstance;

	afterEach(async () => {
		await app.close();
	});

	const get = async (acceptLanguage?: string) => {
		const response = await app.inject({
			url: '/greeting',
			headers: acceptLanguage === undefined ? {} : { 'accept-language': acceptLanguage },
		});
		return response.json<{ locale: string; message: string }>();
	};

	it('uses the default locale when Accept-Language is missing', async () => {
		app = await build();

		expect(await get()).toEqual({ locale: 'en', message: 'Hello' });
	});

	it('maps a regional tag to the supported language', async () => {
		app = await build();

		expect(await get('pt-BR')).toEqual({ locale: 'pt', message: 'Olá' });
	});

	it('honors q weights instead of header order', async () => {
		app = await build();

		expect(await get('en;q=0.5, pt;q=0.9')).toEqual({ locale: 'pt', message: 'Olá' });
	});

	it('falls back to the default locale when no language is supported', async () => {
		app = await build();

		expect(await get('ja, fr;q=0.8')).toEqual({ locale: 'en', message: 'Hello' });
	});

	it('does not leak the locale between concurrent requests', async () => {
		app = await build();

		const results = await Promise.all([get('en'), get('pt'), get('en'), get('pt'), get('en')]);

		expect(results.map((result) => result.message)).toEqual(['Hello', 'Olá', 'Hello', 'Olá', 'Hello']);
	});
});

describe('i18nPlugin with the error handler', () => {
	let app: FastifyInstance;

	afterEach(async () => {
		await app.close();
	});

	it('localizes the error body, falls back for unsupported locales and merges Vary with other plugins', async () => {
		app = fastify();
		app.register(i18nPlugin, I18N_OPTIONS);
		app.register(cors, { origin: true });
		app.setErrorHandler(errorHandler);
		app.get('/missing', async () => {
			throw new NotFoundError('apiResponses.users.notFound', { path: 'test' });
		});
		await app.ready();

		const response = await app.inject({
			url: '/missing',
			headers: { 'accept-language': 'pt-BR', origin: 'http://localhost:3000' },
		});

		expect(response.statusCode).toBe(404);
		expect(response.json()).toEqual({
			ok: false,
			code: 'NOT_FOUND',
			localeKey: 'apiResponses.users.notFound',
			message: en['apiResponses.users.notFound'],
		});
		expect(response.headers['content-language']).toBe('en');
		expect(String(response.headers.vary).split(/,\s*/)).toEqual(
			expect.arrayContaining(['Origin', 'Accept-Language']),
		);
	});
});
