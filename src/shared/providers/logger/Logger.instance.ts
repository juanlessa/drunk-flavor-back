import { parseLogEnv } from '@/env/log';
import { type LogLevel } from './logger.types';
import { ILoggerProvider } from './ILogger.provider';
import { ConsoleLoggerProvider } from './implementations/ConsoleLogger.provider';

export class LoggerInstance {
	private static _instance: LoggerInstance;
	public readonly level: LogLevel;
	private loggerInstance: ILoggerProvider;

	private constructor(loggerInstance?: ILoggerProvider) {
		const envLogLevel = parseLogEnv().LOG_LEVEL;
		this.loggerInstance = loggerInstance ?? new ConsoleLoggerProvider(envLogLevel);
		this.level = envLogLevel;
	}

	static get Instance() {
		return this._instance || (this._instance = new this());
	}

	public static setLogger<T>(newLogger: T) {
		LoggerInstance.Instance.loggerInstance = newLogger as ILoggerProvider;
	}

	public get logger() {
		return LoggerInstance.Instance.loggerInstance;
	}
}
