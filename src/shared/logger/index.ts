import Logger, { LoggerRepository } from './logger.repository';

export * from './logger.repository';
export * from './logger.constants';
export * from './logger.types';
export const logger = LoggerRepository.Instance.logger;
export default Logger;
