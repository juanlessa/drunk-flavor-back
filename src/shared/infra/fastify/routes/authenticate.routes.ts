import { authenticateUserController } from '@/modules/accounts/useCases/authenticateUser/AuthenticateUser.controller';
import { authenticateUserSchema } from '@/modules/accounts/useCases/authenticateUser/authenticateUser.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';

const routes: Routes = (server) => {
	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/sessions', { schema: { body: authenticateUserSchema } }, authenticateUserController);
};

export const authenticateRoutes = pluginGenerator(routes);
