import { P, match } from 'ts-pattern';
import { AppError } from '@shared/errors/error.lib';
import { AppNextFunction, AppRequest, AppResponse } from '@shared/infra/http/types';
import {
	handleMongoError,
	handleMongooseError,
	instanceOfMongoError,
	instanceOfMongooseError
} from '@shared/infra/mongo/mongo.errors';
import { handleAppError } from '@shared/errors/handleAppError';
import { unhandledError } from '@shared/errors/unhandledError';
import { ErrorResponse } from '@shared/errors/error.dtos';

export async function errorHandler(err: Error, _request: AppRequest, response: AppResponse, _next: AppNextFunction) {
	const { statusCode, message }: ErrorResponse = match(err)
		.with(P.instanceOf(AppError), handleAppError)
		.when(instanceOfMongoError, handleMongoError)
		.when(instanceOfMongooseError, handleMongooseError)
		.otherwise(unhandledError);

	return response.status(statusCode).json({ ok: false, message });
}
