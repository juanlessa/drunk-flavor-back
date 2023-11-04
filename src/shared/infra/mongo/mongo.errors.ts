import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { resolveLoggerProvider } from '@shared/container/providers/logger';
import { ErrorResponse } from '@shared/errors/error.dtos';
import { MongoError } from 'mongodb';
import { MongooseError } from 'mongoose';

const logger = resolveLoggerProvider();

export const instanceOfMongooseError = (error: unknown): error is MongooseError => error instanceof MongooseError;
export const handleMongooseError = (error: MongooseError): ErrorResponse => {
	logger.error(error, `MongooseError(${error.name}): ${error.message}`);
	return { statusCode: HTTP_STATUS.internal_server_error, message: error.message };
};

export const instanceOfMongoError = (error: unknown): error is MongoError => error instanceof MongoError;
export const handleMongoError = (error: MongoError): ErrorResponse => {
	logger.error(error, `MongoError(${error.name}): ${error.code} - ${error.message}`);
	return { statusCode: HTTP_STATUS.internal_server_error, message: error.message };
};
