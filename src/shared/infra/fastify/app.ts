import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import session from "@fastify/secure-session";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { errorHandler } from "./middlewares/errorHandler";
import { TOKEN_OPTIONS } from "./constants/jwt.constants";
import { SESSION_OPTIONS } from "./constants/session.constants";
import { FASTIFY_COOKIE_OPTIONS } from "./constants/cookie.constants";
import { router } from "./routes";
import { FASTIFY_LOGGER_OPTIONS } from "./constants/logger.constants";
import { LoggerRepository, logger } from "@/shared/logger";
import { env } from "@/env";
import { SWAGGER_OPTIONS } from "./constants/swagger.constants";

export const app = fastify({
  logger: FASTIFY_LOGGER_OPTIONS,
});

app.register(fastifyCookie, FASTIFY_COOKIE_OPTIONS);
app.register(fastifyJwt, TOKEN_OPTIONS);
app.register(session, SESSION_OPTIONS);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

void app.register(fastifySwagger, {
  ...SWAGGER_OPTIONS,
  transform: jsonSchemaTransform,
});

router.map((route) => app.register(route));
app.setErrorHandler(errorHandler);

export const start = async () => {
  LoggerRepository.setLogger(app.log);

  try {
    await app.ready();

    logger.info("plugins\n" + app.printPlugins());
    logger.info(
      "routes\n" +
        app.printRoutes({
          commonPrefix: false,
          includeHooks: false,
          includeMeta: ["metaProperty"],
        })
    );

    logger.info(
      `Documentation running at http://${env.API_HOST}:${env.API_PORT}/documentation \n`
    );

    await app.listen({ host: env.API_HOST, port: env.API_PORT });
  } catch (err) {
    app.log.fatal(err);
    process.exit(1);
  }
};
