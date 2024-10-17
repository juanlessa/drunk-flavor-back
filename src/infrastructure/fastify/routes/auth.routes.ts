import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { signupSchema } from '@/core/accounts/useCases/signup/signup.schema';
import { signupController } from '@/core/accounts/useCases/signup/signup.controller';
import { confirmEmailSchema } from '@/core/accounts/useCases/confirmEmail/confirmEmail.schema';
import { confirmEmailController } from '@/core/accounts/useCases/confirmEmail/confirmEmail.controller';
import { loginController } from '@/core/accounts/useCases/login/login.controller';
import { loginSchema } from '@/core/accounts/useCases/login/login.schema';
import { forgotPasswordSchema } from '@/core/accounts/useCases/forgotPassword/forgotPassword.schema';
import { forgotPasswordController } from '@/core/accounts/useCases/forgotPassword/forgotPassword.controller';
import { resetPasswordSchema } from '@/core/accounts/useCases/resetPassword/resetPassword.schema';
import { resetPasswordController } from '@/core/accounts/useCases/resetPassword/resetPassword.controller';
import { updatePasswordSchema } from '@/core/accounts/useCases/updatePassword/updatePassword.schema';
import { updatePasswordController } from '@/core/accounts/useCases/updatePassword/updatePassword.controller';
import { getProfileController } from '@/core/accounts/useCases/getProfile/getProfile.controller';
import { updateProfileSchema } from '@/core/accounts/useCases/updateProfile/updateProfile.schema';
import { updateProfileController } from '@/core/accounts/useCases/updateProfile/updateProfile.controller';
import { deleteProfileController } from '@/core/accounts/useCases/deleteProfile/deleteProfile.controller';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { refreshTokenController } from '@/core/accounts/useCases/refreshToken/refreshToken.controller';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post('/signup', { schema: { body: signupSchema } }, signupController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/confirm-email', { schema: { body: confirmEmailSchema } }, confirmEmailController);

	server.withTypeProvider<ZodTypeProvider>().post('/login', { schema: { body: loginSchema } }, loginController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/forgot-password', { schema: { body: forgotPasswordSchema } }, forgotPasswordController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/reset-password', { schema: { body: resetPasswordSchema } }, resetPasswordController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.patch(
			'/update-password',
			{ schema: { body: updatePasswordSchema }, preValidation: [verifyAndRenewToken] },
			updatePasswordController,
		);

	server.withTypeProvider<ZodTypeProvider>().post('/refresh-token', {}, refreshTokenController);

	server.get('/me', { preValidation: [verifyAndRenewToken] }, getProfileController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.patch(
			'/me',
			{ schema: { body: updateProfileSchema }, preValidation: [verifyAndRenewToken] },
			updateProfileController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.delete('/me', { preValidation: [verifyAndRenewToken] }, deleteProfileController);
};

export const authRoutes = pluginGenerator(routes);
