import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { signupSchema } from '@/core/accounts/useCases/signup/signup.schema';
import { signupController } from '@/core/accounts/useCases/signup/signup.controller';
import { authenticateUserController } from '@/core/accounts/useCases/authenticateUser/authenticateUser.controller';
import { authenticateUserSchema } from '@/core/accounts/useCases/authenticateUser/authenticateUser.schema';
import { forgotPasswordSchema } from '@/core/accounts/useCases/forgotPassword/forgotPassword.schema';
import { forgotPasswordController } from '@/core/accounts/useCases/forgotPassword/forgotPassword.controller';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post('/signup', { schema: { body: signupSchema } }, signupController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/sessions', { schema: { body: authenticateUserSchema } }, authenticateUserController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/forgot-password', { schema: { body: forgotPasswordSchema } }, forgotPasswordController);
};

export const authenticateRoutes = pluginGenerator(routes);
