import { pino, type Logger, type LoggerOptions } from 'pino';
import { parseLogEnv } from '@/env/log';
import { type ILoggerProvider } from '../ILogger.provider';
import { LogLevel, type LogFunction } from '../logger.types';
import { PINO_LOGGER_OPTIONS } from './pinoLogger.constants';

export class PinoLoggerProvider implements ILoggerProvider {
	private readonly pino: Logger;

	readonly trace: LogFunction;
	readonly debug: LogFunction;
	readonly info: LogFunction;
	readonly warn: LogFunction;
	readonly error: LogFunction;
	readonly fatal: LogFunction;
	/** Delegates to Pino's built-in `silent`, a no-op by design. */
	readonly silent: LogFunction;

	constructor(options: LoggerOptions = PINO_LOGGER_OPTIONS) {
		this.pino = pino(options);

		this.trace = this.pino.trace.bind(this.pino);
		this.debug = this.pino.debug.bind(this.pino);
		this.info = this.pino.info.bind(this.pino);
		this.warn = this.pino.warn.bind(this.pino);
		this.error = this.pino.error.bind(this.pino);
		this.fatal = this.pino.fatal.bind(this.pino);
		this.silent = this.pino.silent.bind(this.pino);
	}

	get level(): LogLevel {
		return this.pino.level as LogLevel;
	}
}
