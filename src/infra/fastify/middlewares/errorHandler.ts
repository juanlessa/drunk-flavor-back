import { P, match } from 'ts-pattern';
import { ZodError } from 'zod';
import { AppError } from '@/shared/error/error.lib';
import { handleMongoError, instanceOfMongoError } from '@/infra/mongo/mongo.errors';
import { handleMongooseError, instanceOfMongooseError } from '@/infra/mongo/mongoose.errors';
import { handleAppError } from '@/shared/error/handleAppError';
import { unhandledError } from '@/shared/error/unhandledError';
import { ErrorResponse } from '@/shared/error/error.dtos';
import { handleFastifyZodError } from '@/infra/fastify/errors/fastifyZodError';
import { handleFastifyError, instanceOfFastifyError } from '@/infra/fastify/errors/fastifyError';
import { ErrorHandler } from '../types/fastify.types';

export const handleCustomError = (error: unknown) =>
	match(error)
		.with(P.instanceOf(AppError), handleAppError)
		.with(P.instanceOf(ZodError), handleFastifyZodError)
		.when(instanceOfFastifyError, handleFastifyError)
		.when(instanceOfMongoError, handleMongoError)
		.when(instanceOfMongooseError, handleMongooseError)
		.otherwise(unhandledError);

export const errorHandler: ErrorHandler = async (error, _request, reply) => {
	const { statusCode, message }: ErrorResponse = handleCustomError(error);

	return reply.status(statusCode).send({ ok: false, message });
};
