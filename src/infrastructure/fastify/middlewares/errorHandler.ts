import { P, match } from 'ts-pattern';
import { AppError } from '@/shared/error/error.lib';
import { handleMongoError, instanceOfMongoError } from '@/infrastructure/mongo/mongo.errors';
import { handleMongooseError, instanceOfMongooseError } from '@/infrastructure/mongo/mongoose.errors';
import { handleRedisError, instanceOfRedisError } from '@/infrastructure/redis/redis.errors';
import { handleBullMQError, instanceOfBullMQError } from '@/infrastructure/bullmq/bullmq.errors';
import { handleAppError } from '@/shared/error/handleAppError';
import { unhandledError } from '@/shared/error/unhandledError';
import { ErrorResponse } from '@/shared/error/error.dtos';
import { handleFastifyError, instanceOfFastifyError } from '@/infrastructure/fastify/errors/fastifyError';
import { ErrorHandler } from '../types/fastify.types';

export const handleCustomError = (error: unknown) =>
	match(error)
		.with(P.instanceOf(AppError), handleAppError)
		.when(instanceOfFastifyError, handleFastifyError)
		.when(instanceOfMongoError, handleMongoError)
		.when(instanceOfMongooseError, handleMongooseError)
		.when(instanceOfRedisError, handleRedisError)
		.when(instanceOfBullMQError, handleBullMQError)
		.otherwise(unhandledError);

export const errorHandler: ErrorHandler = async (error, request, reply) => {
	const { statusCode, localeKey }: ErrorResponse = handleCustomError(error);

	const message = request.i18n.t(localeKey);

	return reply.status(statusCode).send({ ok: false, localeKey, message });
};
