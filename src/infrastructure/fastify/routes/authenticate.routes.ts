import { authenticateUserController } from '@/core/accounts/useCases/authenticateUser/authenticateUser.controller';
import { authenticateUserSchema } from '@/core/accounts/useCases/authenticateUser/authenticateUser.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { resetUserPasswordSchema } from '@/core/accounts/useCases/resetUserPassword/resetUserPassword.schema';
import { resetUserPasswordController } from '@/core/accounts/useCases/resetUserPassword/resetUserPassword.controller';

const routes: Routes = (server) => {
	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/sessions', { schema: { body: authenticateUserSchema } }, authenticateUserController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/reset-password', { schema: { body: resetUserPasswordSchema } }, resetUserPasswordController);
};

export const authenticateRoutes = pluginGenerator(routes);
