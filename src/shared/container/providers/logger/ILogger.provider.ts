import { RequestHandler } from 'express';

export interface ILoggerProvider {
	getHttpMiddleware(): RequestHandler;
	info(obj: Object, msg?: string, ...args: any[]): void;
	debug(obj: Object, msg?: string, ...args: any[]): void;
	error(obj: Object, msg?: string, ...args: any[]): void;
}
