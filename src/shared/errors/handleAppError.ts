import { resolveLoggerProvider } from '@shared/container/providers/logger';
import AppError from './AppError';

const logger = resolveLoggerProvider();

export const handleAppError = (error: AppError): AppError => {
	logger.error(error);
	return error;
};
