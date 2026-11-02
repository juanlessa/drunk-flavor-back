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
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { AUTH_COOKIE } from '../constants/cookie.constants';
import { i18n } from '@/infrastructure/i18n';
import { setLocalizedResponseHeaders } from '@/infrastructure/i18n/i18n.helpers';
import { resolveErrorCode } from '@/shared/error/error.codes';

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
	if (error instanceof SessionRevokedError) {
		request.session.delete();
		reply.clearCookie(AUTH_COOKIE);
	}

	const { statusCode, localeKey, errors }: ErrorResponse = handleCustomError(error);

	const message = i18n.translate(request.locale, localeKey);
	setLocalizedResponseHeaders(reply, request.locale);

	return reply.status(statusCode).send({
		ok: false,
		code: resolveErrorCode(localeKey, statusCode),
		localeKey,
		message,
		...(errors && {
			errors: errors.map((fieldError) => ({
				...fieldError,
				message: i18n.translate(request.locale, fieldError.localeKey, fieldError.params),
			})),
		}),
	});
};
