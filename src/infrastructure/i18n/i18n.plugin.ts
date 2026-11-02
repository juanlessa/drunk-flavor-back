import accepts from '@fastify/accepts';
import fastifyPlugin from 'fastify-plugin';
import type { I18nPluginOptions } from './i18n.types';

/**
 * Resolves the request locale from `Accept-Language` (RFC 9110 section 12.5.4, including `q` weights)
 * and stores it on `request.locale`. The locale lives on the request itself, never on a shared object.
 *
 * Must be registered before any plugin whose hooks can raise errors (for example rate limiting),
 * so that `request.locale` is already set when the error handler runs.
 */
export const i18nPlugin = fastifyPlugin<I18nPluginOptions>(
	async (server, { defaultLocale, supportedLocales }) => {
		await server.register(accepts);
		server.decorateRequest('locale', defaultLocale);
		server.addHook('onRequest', async (request) => {
			const negotiated = request.language([...supportedLocales]);
			request.locale = negotiated || defaultLocale;
		});
	},
	{ name: 'i18n' },
);
