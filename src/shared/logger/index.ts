import { env } from '@/env';
import { BaseLogger } from './logger.types';

let logger: BaseLogger = console;
logger.level = env.LOG_LEVEL;

const setLogger = <T>(newLogger: T) => {
	logger = newLogger as BaseLogger;
};

export { logger, setLogger };
