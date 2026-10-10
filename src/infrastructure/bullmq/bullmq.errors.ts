import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { ErrorResponse } from '@/shared/error/error.dtos';
import { logger } from '@/shared/providers/logger';
import { ConnectionClosedError, RateLimitError, UnrecoverableError } from 'bullmq';

const BULLMQ_ERROR_CONSTRUCTORS = [ConnectionClosedError, RateLimitError, UnrecoverableError] as const;

export type BullMQError = InstanceType<(typeof BULLMQ_ERROR_CONSTRUCTORS)[number]>;

export const instanceOfBullMQError = (error: unknown): error is BullMQError =>
	BULLMQ_ERROR_CONSTRUCTORS.some((constructor) => error instanceof constructor);

export const handleBullMQError = (error: BullMQError): ErrorResponse => {
	logger.error({ err: error }, `bullmq.handleBullMQError(${error.name}): ${error.message}`);

	return {
		statusCode: HTTP_STATUS.internal_server_error,
		localeKey: 'apiResponses.internalServerError',
	};
};
