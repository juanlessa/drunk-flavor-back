import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { signupSchema } from '@/core/accounts/useCases/signup/signup.schema';
import { signupController } from '@/core/accounts/useCases/signup/signup.controller';
import { loginController } from '@/core/accounts/useCases/login/login.controller';
import { loginSchema } from '@/core/accounts/useCases/login/login.schema';
import { forgotPasswordSchema } from '@/core/accounts/useCases/forgotPassword/forgotPassword.schema';
import { forgotPasswordController } from '@/core/accounts/useCases/forgotPassword/forgotPassword.controller';
import { deleteProfileController } from '@/core/accounts/useCases/deleteProfile/deleteProfile.controller';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post('/signup', { schema: { body: signupSchema } }, signupController);

	server.withTypeProvider<ZodTypeProvider>().post('/login', { schema: { body: loginSchema } }, loginController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/forgot-password', { schema: { body: forgotPasswordSchema } }, forgotPasswordController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.delete('/me', { preValidation: [verifyAndRenewToken] }, deleteProfileController);
};

export const authRoutes = pluginGenerator(routes);
