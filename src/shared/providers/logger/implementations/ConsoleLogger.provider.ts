import { parseLogEnv, type LogLevel } from '@/env/log';
import { LOG_LEVEL_RANK } from '../logger.constants';
import { type ILoggerProvider } from '../ILogger.provider';
import { type LogFunction } from '../logger.types';

export class ConsoleLoggerProvider implements ILoggerProvider {
	constructor(private logLevel: LogLevel = parseLogEnv().LOG_LEVEL ?? 'debug') {}

	get level(): LogLevel {
		return this.logLevel;
	}

	private resolveThreshold(): number {
		return LOG_LEVEL_RANK[this.level];
	}

	private shouldLog(methodLevel: Exclude<LogLevel, 'silent'>): boolean {
		return LOG_LEVEL_RANK[methodLevel] >= this.resolveThreshold();
	}

	// `console` has no `trace`/`fatal`; `debug`/`error` are the closest sinks.
	trace: LogFunction = (...args: unknown[]): void => {
		if (this.shouldLog('trace')) {
			console.debug(...args);
		}
	};

	debug: LogFunction = (...args: unknown[]): void => {
		if (this.shouldLog('debug')) {
			console.debug(...args);
		}
	};

	info: LogFunction = (...args: unknown[]): void => {
		if (this.shouldLog('info')) {
			console.info(...args);
		}
	};

	warn: LogFunction = (...args: unknown[]): void => {
		if (this.shouldLog('warn')) {
			console.warn(...args);
		}
	};

	error: LogFunction = (...args: unknown[]): void => {
		if (this.shouldLog('error')) {
			console.error(...args);
		}
	};

	fatal: LogFunction = (...args: unknown[]): void => {
		if (this.shouldLog('fatal')) {
			console.error(...args);
		}
	};

	/**
	 * `silent` is the lowest rank in `LOG_LEVEL_RANK` and, following the Pino
	 * convention, is a no-op sink: calling it never emits, regardless of the
	 * configured level. It exists so the provider satisfies the full logger
	 * surface and callers can route discarded output through it.
	 */
	silent: LogFunction = (): void => {
		// Intentionally does nothing.
	};
}
