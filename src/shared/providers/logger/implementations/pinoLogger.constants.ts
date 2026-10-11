import { type LoggerOptions, type TransportSingleOptions } from 'pino';
import { type PrettyOptions } from 'pino-pretty';
import { parseLogEnv } from '@/env/log';

const { LOG_LEVEL, LOG_ENABLED, LOG_ENABLE_PRETTY, LOG_PID_HOSTNAME } = parseLogEnv();

const PINO_PRETTY_OPTIONS = {
	translateTime: 'HH:MM:ss Z',
	ignore: LOG_PID_HOSTNAME ? undefined : 'pid,hostname',
	colorize: true,
} as const satisfies PrettyOptions;

const PINO_LOGGER_TRANSPORT = {
	target: 'pino-pretty',
	options: PINO_PRETTY_OPTIONS,
} as const satisfies TransportSingleOptions<PrettyOptions>;

export const PINO_LOGGER_OPTIONS = {
	level: LOG_LEVEL,
	enabled: LOG_ENABLED,
	transport: LOG_ENABLE_PRETTY ? PINO_LOGGER_TRANSPORT : undefined,
} as const satisfies LoggerOptions;
