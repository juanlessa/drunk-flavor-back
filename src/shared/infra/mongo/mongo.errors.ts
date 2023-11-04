import { resolveLoggerProvider } from '@shared/container/providers/logger';
import AppError from '@shared/errors/AppError';
import { MongoError } from 'mongodb';
import { MongooseError } from 'mongoose';

const logger = resolveLoggerProvider();

export const instanceOfMongooseError = (error: unknown): error is MongooseError => error instanceof MongooseError;
export const handleMongooseError = (error: MongooseError): AppError => {
	logger.error(error, `MongooseError(${error.name}): ${error.message}`);
	return new AppError(error.message, 500);
};

export const instanceOfMongoError = (error: unknown): error is MongoError => error instanceof MongoError;
export const handleMongoError = (error: MongoError): AppError => {
	logger.error(error, `MongoError(${error.name}): ${error.code} - ${error.message}`);
	return new AppError(error.message, 500);
};
