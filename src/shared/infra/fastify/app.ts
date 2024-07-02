import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { docsInfo } from "@/shared/docs";
import session from "@fastify/secure-session";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { errorHandler } from "./middlewares/errorHandler";
import { TOKEN_OPTIONS } from "./constants/jwt.constants";
import { SESSION_OPTIONS } from "./constants/session.constants";
import { FASTIFY_COOKIE_OPTIONS } from "./constants/cookie.constants";
import { MongoRepository } from "../mongo/Mongo.repository";
import { router } from "./routes";
import { FASTIFY_LOGGER_OPTIONS } from "./constants/logger.constants";

MongoRepository.Instance.start();

export const app = fastify({
  logger: FASTIFY_LOGGER_OPTIONS,
});

app.register(fastifyJwt, TOKEN_OPTIONS);
app.register(fastifyCookie, FASTIFY_COOKIE_OPTIONS);
app.register(session, SESSION_OPTIONS);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

void app.register(fastifySwagger, {
  openapi: {
    info: docsInfo,
    servers: [],
  },
  transform: jsonSchemaTransform,
});

router.map((route) => app.register(route));

app.setErrorHandler(errorHandler);
