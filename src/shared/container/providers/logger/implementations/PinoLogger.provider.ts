import pino, { Logger } from 'pino';
import pinoHttp, { HttpLogger } from 'pino-http';
import loggerConfig from '@config/logger';
import { ILoggerProvider } from '../ILogger.provider';

export class PinoLoggerProvider implements ILoggerProvider {
	private logger: Logger;
	private httpMiddleware: HttpLogger;
	constructor() {
		this.logger = pino({
			enabled: loggerConfig.enabled,
			level: loggerConfig.level,
			transport: {
				target: 'pino-pretty',
				options: {
					colorize: true
				}
			}
		});
		this.httpMiddleware = pinoHttp({ logger: this.logger });
	}

	getHttpMiddleware(): HttpLogger {
		return this.httpMiddleware;
	}

	info(obj: Object, msg?: string, ...args: any[]) {
		this.logger.info(obj, msg, ...args);
	}

	debug(obj: Object, msg?: string, ...args: any[]) {
		this.logger.debug(obj, msg, ...args);
	}

	error(obj: Object, msg?: string, ...args: any[]) {
		this.logger.error(obj, msg, ...args);
	}
}
