import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { livenessResponseSchema, readinessResponseSchema } from './health.schema';
import { checkReadiness } from './health.service';
import { HTTP_STATUS } from '@/shared/constants/http.constants';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().get(
		'/health/live',
		{
			schema: {
				tags: ['Health'],
				summary: 'Liveness probe',
				description: 'Returns 200 when the service process is up. Does not check any dependency.',
				response: {
					200: livenessResponseSchema,
				},
			},
		},
		async (_request, reply) => {
			return reply.send({ status: 'ok' });
		},
	);

	server.withTypeProvider<ZodTypeProvider>().get(
		'/health/ready',
		{
			schema: {
				tags: ['Health'],
				summary: 'Readiness probe',
				description:
					'Reports whether Mongo, Redis and BullMQ are reachable. 200 when all are up, 503 otherwise. No internal details are exposed.',
				response: {
					200: readinessResponseSchema,
					503: readinessResponseSchema,
				},
			},
		},
		async (_request, reply) => {
			const { report, ok } = await checkReadiness();
			const statusCode = ok ? HTTP_STATUS.ok : HTTP_STATUS.service_unavailable;
			return reply.status(statusCode as 200 | 503).send(report);
		},
	);
};

export const healthRoutes = pluginGenerator(routes);
