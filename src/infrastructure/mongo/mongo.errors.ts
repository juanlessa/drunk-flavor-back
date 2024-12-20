import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { ErrorResponse } from '@/shared/error/error.dtos';
import { logger } from '@/shared/logger';
import { MongoError } from 'mongodb';

export const instanceOfMongoError = (error: unknown): error is MongoError => error instanceof MongoError;

export const handleMongoError = (error: MongoError): ErrorResponse => {
	logger.error(`mongo.handleMongoError(${error.name}): ${error.code} - ${error.message}`);
	logger.error(error);

	return {
		statusCode: HTTP_STATUS.internal_server_error,
		localeKey: 'apiResponses.internalServerError',
	};
};
