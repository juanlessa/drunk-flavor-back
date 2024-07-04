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
