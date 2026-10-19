import fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import session from '@fastify/secure-session';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import i18n from 'fastify-i18n';
import rateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { errorHandler } from './middlewares/errorHandler';
import { REFRESH_TOKEN_OPTIONS, TOKEN_OPTIONS } from './constants/jwt.constants';
import { SESSION_OPTIONS } from './constants/session.constants';
import { FASTIFY_COOKIE_OPTIONS } from './constants/cookie.constants';
import { router } from './routes';
import { LoggerInstance } from '@/shared/providers/logger/Logger.instance';
import { env } from '@/env';
import { DOCS_URL, SWAGGER_OPTIONS, SWAGGER_UI_OPTIONS } from './constants/swagger.constants';
import { MULTIPART_OPTIONS } from './constants/multipart.constants';
import { STATIC_FILES_OPTIONS, STATIC_FILES_URL } from './constants/static.constants';
import { setLogger, logger } from '@/shared/providers/logger';
import { I18N_OPTIONS } from './constants/i18n.constants';
import { PINO_LOGGER_OPTIONS } from '@/shared/providers/logger/implementations/pinoLogger.constants';
import { CORS_OPTIONS } from './constants/cors.constants';
import {
	SERVER_BODY_LIMIT,
	SERVER_CONNECTION_TIMEOUT_MS,
	SERVER_KEEP_ALIVE_TIMEOUT_MS,
	SERVER_REQUEST_TIMEOUT_MS,
} from './constants/server.constants';
import { RATE_LIMIT_OPTIONS } from './constants/rateLimit.constants';

export const app = fastify({
	logger: PINO_LOGGER_OPTIONS,
	bodyLimit: SERVER_BODY_LIMIT,
	requestTimeout: SERVER_REQUEST_TIMEOUT_MS,
	connectionTimeout: SERVER_CONNECTION_TIMEOUT_MS,
	keepAliveTimeout: SERVER_KEEP_ALIVE_TIMEOUT_MS,
	trustProxy: env.RATE_LIMIT_TRUSTED_PROXY,
});

app.register(helmet);
app.register(i18n, I18N_OPTIONS);
app.register(rateLimit, RATE_LIMIT_OPTIONS);
app.register(cors, CORS_OPTIONS);
app.register(fastifyCookie, FASTIFY_COOKIE_OPTIONS);
app.register(fastifyJwt, TOKEN_OPTIONS);
app.register(fastifyJwt, REFRESH_TOKEN_OPTIONS);
app.register(session, SESSION_OPTIONS);
app.register(fastifyMultipart, MULTIPART_OPTIONS);
app.register(fastifyStatic, STATIC_FILES_OPTIONS);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

void app.register(fastifySwagger, {
	...SWAGGER_OPTIONS,
	transform: jsonSchemaTransform,
});

void app.register(fastifySwaggerUI, SWAGGER_UI_OPTIONS);

router.map((route) => app.register(route));
app.setErrorHandler(errorHandler);

export const startApp = async () => {
	LoggerInstance.setLogger(app.log);
	setLogger(app.log);

	await app.ready();

	logger.debug('plugins\n' + app.printPlugins());
	logger.debug(
		'routes\n' +
			app.printRoutes({
				commonPrefix: false,
				includeHooks: false,
				includeMeta: ['metaProperty'],
			}),
	);

	logger.info(`Documentation running at ${DOCS_URL} \n`);
	logger.info(`Static files served at ${STATIC_FILES_URL} \n`);

	await app.listen({ host: env.API_HOST, port: env.API_PORT });
};
