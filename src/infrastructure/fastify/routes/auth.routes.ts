import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { refreshTokenController } from '@/core/accounts/useCases/auth/refreshToken/refreshToken.controller';
import { signupSchema } from '@/core/accounts/useCases/auth/signup/signup.schema';
import { signupController } from '@/core/accounts/useCases/auth/signup/signup.controller';
import { loginSchema } from '@/core/accounts/useCases/auth/login/login.schema';
import { loginController } from '@/core/accounts/useCases/auth/login/login.controller';
import { forgotPasswordSchema } from '@/core/accounts/useCases/auth/forgotPassword/forgotPassword.schema';
import { forgotPasswordController } from '@/core/accounts/useCases/auth/forgotPassword/forgotPassword.controller';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post('/signup', { schema: { body: signupSchema } }, signupController);

	server.withTypeProvider<ZodTypeProvider>().post('/login', { schema: { body: loginSchema } }, loginController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/forgot-password', { schema: { body: forgotPasswordSchema } }, forgotPasswordController);

	server.withTypeProvider<ZodTypeProvider>().post('/refresh-token', {}, refreshTokenController);
};

export const authRoutes = pluginGenerator(routes);
