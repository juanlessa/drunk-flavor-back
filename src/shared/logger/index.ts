import { parseLogEnv } from '@/env/log';
import { BaseLogger } from './logger.types';

let logger: BaseLogger = console;
logger.level = parseLogEnv().LOG_LEVEL;

const setLogger = <T>(newLogger: T) => {
	logger = newLogger as BaseLogger;
};

export { logger, setLogger };
