import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { ErrorResponse } from '@/shared/error/error.dtos';
import { logger } from '@/shared/providers/logger';
import { LocaleKey } from '@/shared/types/locale.types';
import { FastifyError } from 'fastify';

export const instanceOfFastifyError = (error: unknown): error is FastifyError => {
	return 'code' in (error as FastifyError) && 'name' in (error as FastifyError) && error instanceof Error;
};

export const handleFastifyError = (error: FastifyError): ErrorResponse => {
	if (error.validation && error.validation.length > 0) {
		logger.warn(
			{ name: error.name, validationContext: error.validationContext, issues: error.validation },
			'fastify validation failed',
		);

		return {
			statusCode: HTTP_STATUS.bad_request,
			localeKey: error.validation[0].message as LocaleKey,
		};
	}

	logger.error({ err: error }, `fastify.handleFastifyError(${error.name}): ${error.message}.`);

	return {
		statusCode: error.statusCode || HTTP_STATUS.internal_server_error,
		localeKey: (error.message as LocaleKey) || 'apiResponses.internalServerError',
	};
};
