import AppError from '@shared/errors/AppError';
import { resolveLoggerProvider } from '@shared/container/providers/logger';
import { AppNextFunction, AppRequest, AppResponse } from '../types';

const logger = resolveLoggerProvider();

export async function errorHandler(err: Error, request: AppRequest, response: AppResponse, next: AppNextFunction) {
	if (err instanceof AppError) {
		logger.error(err, 'AppError:');
		return response.status(err.statusCode).json({
			status: 'error',
			message: err.message
		});
	}

	logger.error(err, 'Not handled error:');
	return response.status(500).json({
		status: 'error',
		message: 'Internal server error.'
	});
}
