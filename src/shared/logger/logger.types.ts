import { LogLevel } from '@/env/env.types';

type LogFunction = {
	<T extends object>(obj: T, msg?: string, ...args: unknown[]): void;
	(obj: unknown, msg?: string, ...args: unknown[]): void;
	<T extends object>(obj: T, ...args: unknown[]): void;
	(msg: string, ...args: unknown[]): void;
};

export type BaseLogger = {
	level?: LogLevel;
	fatal?: LogFunction;
	error: LogFunction;
	warn: LogFunction;
	info: LogFunction;
	debug: LogFunction;
	trace: LogFunction;
	silent?: LogFunction;
};
