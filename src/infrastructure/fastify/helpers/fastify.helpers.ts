import { env } from '@/env';
import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

export const pluginGenerator = (callback: (server: FastifyInstance) => unknown) => {
	return fastifyPlugin((server, _, done) => {
		try {
			callback(server);
			done();
		} catch (error) {
			done(error as Error);
		}
	});
};

export const getAppURL = () => `http://${env.API_HOST}:${env.API_PORT}`;
