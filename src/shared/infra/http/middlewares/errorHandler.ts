import AppError from '@errors/AppError';
import { PinoLogger } from '@shared/container/providers/logger/implementations/PinoLogger.provider';
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';

const logger = container.resolve(PinoLogger);

export async function errorHandler(err: Error, request: Request, response: Response, next: NextFunction) {
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
