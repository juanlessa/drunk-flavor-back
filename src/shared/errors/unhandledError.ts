import { resolveLoggerProvider } from '@shared/container/providers/logger';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { ErrorResponse } from './error.dtos';

const logger = resolveLoggerProvider();

export const unhandledError = (error: unknown): ErrorResponse => {
	const err = error as Error;
	logger.error(err, `UnhandledError(${err.name}): ${err.message}`);
	return { statusCode: HTTP_STATUS.internal_server_error, message: 'Internal Server Error' };
};
