import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { ErrorResponse } from '@/shared/error/error.dtos';
import { logger } from '@/shared/logger';
import {
	ClientClosedError,
	ClientOfflineError,
	ConnectionTimeoutError,
	DisconnectsClientError,
	ErrorReply,
	ReconnectStrategyError,
	RootNodesUnavailableError,
	SocketClosedUnexpectedlyError,
	SocketTimeoutError,
	TimeoutError,
} from '@redis/client';

const REDIS_ERROR_CONSTRUCTORS = [
	ErrorReply,
	ClientClosedError,
	ClientOfflineError,
	ConnectionTimeoutError,
	DisconnectsClientError,
	ReconnectStrategyError,
	RootNodesUnavailableError,
	SocketClosedUnexpectedlyError,
	SocketTimeoutError,
	TimeoutError,
] as const;

export type RedisError = InstanceType<(typeof REDIS_ERROR_CONSTRUCTORS)[number]>;

export const instanceOfRedisError = (error: unknown): error is RedisError =>
	REDIS_ERROR_CONSTRUCTORS.some((constructor) => error instanceof constructor);

export const handleRedisError = (error: RedisError): ErrorResponse => {
	logger.error({ err: error }, `redis.handleRedisError(${error.name}): ${error.message}`);

	return {
		statusCode: HTTP_STATUS.internal_server_error,
		localeKey: 'apiResponses.internalServerError',
	};
};
