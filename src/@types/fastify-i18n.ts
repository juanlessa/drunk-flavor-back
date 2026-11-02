import 'fastify';

declare module 'fastify' {
	interface FastifyRequest {
		/** Locale negotiated from `Accept-Language`; falls back to the default locale. */
		locale: string;
	}
}
