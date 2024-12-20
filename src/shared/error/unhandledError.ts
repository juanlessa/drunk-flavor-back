import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { ErrorResponse } from './error.dtos';
import { logger } from '@/shared/logger';

export const unhandledError = (error: unknown): ErrorResponse => {
	logger.error(`fastify.unhandledError(${(error as Error).name}): ${(error as Error).message}.`);
	logger.error(error);
	return {
		statusCode: HTTP_STATUS.internal_server_error,
		localeKey: 'apiResponses.internalServerError',
	};
};
