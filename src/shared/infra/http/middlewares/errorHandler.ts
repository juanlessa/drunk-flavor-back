import AppError from '@errors/AppError';
import { Request, Response, NextFunction } from 'express';

export async function errorHandler(err: Error, request: Request, response: Response, next: NextFunction) {
	if (err instanceof AppError) {
		return response.status(err.statusCode).json({
			status: 'error',
			message: err.message
		});
	}
	console.error(err);

	return response.status(500).json({
		status: 'error',
		message: 'Internal server error.'
	});
}
