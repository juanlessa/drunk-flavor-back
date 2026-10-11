import { logLevelOptions } from './logger.constants';

export type LogLevel = (typeof logLevelOptions)[number];

export type LogFunction = {
	<T extends object>(obj: T, msg?: string, ...args: unknown[]): void;
	(obj: unknown, msg?: string, ...args: unknown[]): void;
	<T extends object>(obj: T, ...args: unknown[]): void;
	(msg: string, ...args: unknown[]): void;
};
