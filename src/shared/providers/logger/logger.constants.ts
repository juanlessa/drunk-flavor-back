export const logLevelOptions = ['silent', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;

export const LOG_LEVEL_RANK = {
	silent: 0,
	trace: 1,
	debug: 2,
	info: 3,
	warn: 4,
	error: 5,
	fatal: 6,
} as const;
