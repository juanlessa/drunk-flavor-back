import { HTTP_STATUS } from "@/shared/constants/httpStatus";
import { ErrorResponse } from "@/shared/errors/error.dtos";
import { logger } from "@/shared/logger";
import { FastifyError } from "fastify";

const logStringifiedObject = (value: unknown) =>
  logger.info(JSON.stringify(value));

export const instanceOfFastifyError = (
  error: unknown
): error is FastifyError => {
  return (
    "code" in (error as FastifyError) &&
    "name" in (error as FastifyError) &&
    error instanceof Error
  );
};

export const handleFastifyError = (error: FastifyError): ErrorResponse => {
  logger.error(`fastify.handleFastifyError(${error.name}): ${error.message}.`);
  if (error.validation && error.validation.length > 0) {
    logger.info(
      `fastify.handleFastifyError(${error.name}): failed validation of ${error.validationContext}.\n`
    );
    error.validation.forEach(logStringifiedObject);
  }
  logger.error(error);

  return {
    statusCode: error.statusCode || HTTP_STATUS.internal_server_error,
    message: error.message,
  };
};
