import { ZodError } from 'zod';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { ErrorResponse } from '@/shared/error/error.dtos';
import { logger } from '@/shared/logger';

export const handleFastifyZodError = (error: ZodError): ErrorResponse => {
	logger.error(`fastify.handleFastifyZodError(${error.name}): ${error.message}.`);
	logger.error(error);

	return { statusCode: HTTP_STATUS.bad_request, message: error.message };
};
