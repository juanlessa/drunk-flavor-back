import fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import session from '@fastify/secure-session';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { errorHandler } from './middlewares/errorHandler';
import { REFRESH_TOKEN_OPTIONS, TOKEN_OPTIONS } from './constants/jwt.constants';
import { SESSION_OPTIONS } from './constants/session.constants';
import { FASTIFY_COOKIE_OPTIONS } from './constants/cookie.constants';
import { router } from './routes';
import { FASTIFY_LOGGER_OPTIONS } from './constants/logger.constants';
import { LoggerRepository } from '@/shared/logger/logger.repository';
import { env } from '@/env';
import { DOCS_URL, SWAGGER_OPTIONS, SWAGGER_UI_OPTIONS } from './constants/swagger.constants';
import { MULTIPART_OPTIONS } from './constants/multipart.constants';
import { STATIC_FILES_OPTIONS, STATIC_FILES_URL } from './constants/static.constants';
import { setLogger, logger } from '@/shared/logger';

export const app = fastify({
	logger: FASTIFY_LOGGER_OPTIONS,
});

app.register(helmet);
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

export const start = async () => {
	LoggerRepository.setLogger(app.log);
	setLogger(app.log);

	const origin = 'localhost';
	const originRgx = new RegExp(`${origin}`);
	const originUrl = `https://${origin}`;
	await app.register(cors, {
		credentials: true,
		methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
		cacheControl: 600,
		origin: [originUrl, originRgx],
	});

	try {
		await app.ready();

		logger.info('plugins\n' + app.printPlugins());
		logger.info(
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
	} catch (err) {
		app.log.fatal(err);
		process.exit(1);
	}
};
