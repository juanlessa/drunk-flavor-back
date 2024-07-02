import { P, match } from "ts-pattern";
import { ZodError } from "zod";
import { AppError } from "@/shared/error/error.lib";
import {
  handleMongoError,
  instanceOfMongoError,
} from "@/shared/infra/mongo/mongo.errors";
import {
  handleMongooseError,
  instanceOfMongooseError,
} from "@/shared/infra/mongo/mongoose.errors";
import { handleAppError } from "@/shared/error/handleAppError";
import { unhandledError } from "@/shared/error/unhandledError";
import { ErrorResponse } from "@/shared/error/error.dtos";
import { FastifyReply, FastifyRequest } from "fastify";
import { handleFastifyZodError } from "@/shared/infra/fastify/errors/fastifyZodError";
import {
  handleFastifyError,
  instanceOfFastifyError,
} from "../errors/fastifyError";

export const errorHandler = async (
  error: Error,
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  const { statusCode, message }: ErrorResponse = match(error)
    .with(P.instanceOf(AppError), handleAppError)
    .with(P.instanceOf(ZodError), handleFastifyZodError)
    .when(instanceOfFastifyError, handleFastifyError)
    .when(instanceOfMongoError, handleMongoError)
    .when(instanceOfMongooseError, handleMongooseError)
    .otherwise(unhandledError);

  return reply.status(statusCode).send({ ok: false, message });
};
