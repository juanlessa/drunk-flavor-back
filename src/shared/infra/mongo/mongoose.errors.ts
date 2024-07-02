import { HTTP_STATUS } from "@/shared/constants/httpStatus";
import { ErrorResponse } from "@/shared/error/error.dtos";
import { logger } from "@/shared/logger";
import { MongooseError } from "mongoose";

export const instanceOfMongooseError = (
  error: unknown
): error is MongooseError => error instanceof MongooseError;

export const handleMongooseError = (error: MongooseError): ErrorResponse => {
  logger.error(`mongo.handleMongooseError(${error.name}): ${error.message}`);
  logger.error(error);

  return {
    statusCode: HTTP_STATUS.internal_server_error,
    message: error.message,
  };
};
