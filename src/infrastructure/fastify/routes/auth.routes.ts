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
	server.withTypeProvider<ZodTypeProvider>().post(
		'/signup',
		{
			schema: {
				tags: ['Auth'],
				summary: 'Sign Up',
				description: 'Registers a new user by creating an member account',
				body: signupSchema,
			},
		},
		signupController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/login',
		{
			schema: {
				tags: ['Auth'],
				summary: 'Login',
				description: 'Authenticates the user',
				body: loginSchema,
			},
		},
		loginController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/forgot-password',
		{
			schema: {
				tags: ['Auth'],
				summary: 'Forgot Password',
				description: 'Sends a password reset link to the user email',
				body: forgotPasswordSchema,
			},
		},
		forgotPasswordController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/refresh-token',
		{
			schema: {
				tags: ['Auth'],
				summary: 'Refresh Token',
				description: 'Refreshes the expired access token using the refresh token',
			},
		},
		refreshTokenController,
	);
};

export const authRoutes = pluginGenerator(routes);
