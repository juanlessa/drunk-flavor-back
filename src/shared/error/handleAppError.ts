import { ErrorResponse } from './error.dtos';
import { logger } from '@/shared/logger';
import { AppError } from './error.lib';

export const handleAppError = (error: AppError): ErrorResponse => {
	error.log();
	return { statusCode: error.status, message: error.message };
};
