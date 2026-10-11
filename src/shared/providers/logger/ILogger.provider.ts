import { LogLevel } from '@/env/log';
import { type LogFunction } from './logger.types';

export interface ILoggerProvider {
	level: LogLevel;
	fatal: LogFunction;
	error: LogFunction;
	warn: LogFunction;
	info: LogFunction;
	debug: LogFunction;
	trace: LogFunction;
	silent: LogFunction;
}
