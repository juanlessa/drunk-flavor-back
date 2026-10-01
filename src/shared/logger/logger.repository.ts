import { parseLogEnv } from '@/env/log';
import { BaseLogger } from './logger.types';

export class LoggerRepository {
	private static _instance: LoggerRepository;

	private constructor(
		private loggerInstance: BaseLogger = console,
		public readonly level = parseLogEnv().LOG_LEVEL,
	) {}

	static get Instance() {
		return this._instance || (this._instance = new this());
	}

	public static setLogger<T>(newLogger: T) {
		LoggerRepository.Instance.loggerInstance = newLogger as BaseLogger;
	}

	public get logger() {
		return LoggerRepository.Instance.loggerInstance;
	}
}

export const loggerInstance = LoggerRepository.Instance;
