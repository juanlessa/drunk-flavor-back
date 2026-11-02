import { parseCorsEnv } from '@/env/cors';
import { FastifyCorsOptions } from '@fastify/cors';

const { CORS_ALLOWED_ORIGINS } = parseCorsEnv();

export const CORS_OPTIONS = {
	origin: CORS_ALLOWED_ORIGINS,
	credentials: true,
	methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
	// X-Requested-With is the CSRF header required on the Google authorization code endpoints.
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	// exposedHeaders: ['Content-Range'], // only if front needs to read some header
	maxAge: 600,
	strictPreflight: true,
} satisfies FastifyCorsOptions;
