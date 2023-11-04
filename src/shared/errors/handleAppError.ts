import { ErrorResponse } from './error.dtos';
import { resolveLoggerProvider } from '@shared/container/providers/logger';
import { AppError } from './error.lib';

const logger = resolveLoggerProvider();

export const handleAppError = (error: AppError): ErrorResponse => {
	logger.error(error, `${error.path || error.name}: ${error.message}`);
	return { statusCode: error.status, message: error.message };
};
