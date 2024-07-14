import { env } from '@/env';

const EnvToLogger = {
	development: {
		level: env.LOG_LEVEL,
		enabled: env.LOG_ENABLED,
		transport: {
			target: 'pino-pretty',
			options: {
				translateTime: 'HH:MM:ss Z',
				ignore: 'pid,hostname',
				colorize: true,
			},
		},
	},
	production: {
		level: env.LOG_LEVEL,
		enabled: env.LOG_ENABLED,
		transport: {
			target: 'pino-pretty',
			options: {
				translateTime: 'HH:MM:ss Z',
				colorize: true,
			},
		},
	},
	e2e: false,
	testing: false,
};

const environment = (env.NODE_ENV ?? 'production') as keyof typeof EnvToLogger;

export const FASTIFY_LOGGER_OPTIONS = EnvToLogger[environment];
