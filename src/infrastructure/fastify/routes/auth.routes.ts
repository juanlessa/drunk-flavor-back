import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { signOut } from '../middlewares/signOut';
import { Routes } from '../types/fastify.types';
import { refreshTokenController } from '@/core/accounts/useCases/auth/refreshToken/refreshToken.controller';
import { signupSchema } from '@/core/accounts/useCases/auth/signup/signup.schema';
import { signupController } from '@/core/accounts/useCases/auth/signup/signup.controller';
import { signinSchema } from '@/core/accounts/useCases/auth/signin/signin.schema';
import { signinController } from '@/core/accounts/useCases/auth/signin/signin.controller';
import { requestPasswordResetSchema } from '@/core/accounts/useCases/auth/requestPasswordReset/requestPasswordReset.schema';
import { requestPasswordResetController } from '@/core/accounts/useCases/auth/requestPasswordReset/requestPasswordReset.controller';
import { confirmPasswordSchema } from '@/core/accounts/useCases/auth/confirmPassword/confirmPassword.schema';
import { confirmPasswordController } from '@/core/accounts/useCases/auth/confirmPassword/confirmPassword.controller';
import { resendEmailVerificationSchema } from '@/core/accounts/useCases/auth/resendEmailVerification/resendEmailVerification.schema';
import { resendEmailVerificationController } from '@/core/accounts/useCases/auth/resendEmailVerification/resendEmailVerification.controller';
import { confirmEmailSchema } from '@/core/accounts/useCases/auth/confirmEmail/confirmEmail.schema';
import { confirmEmailController } from '@/core/accounts/useCases/auth/confirmEmail/confirmEmail.controller';

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
		'/signin',
		{
			schema: {
				tags: ['Auth'],
				summary: 'Sign In',
				description: 'Authenticates the user',
				body: signinSchema,
			},
		},
		signinController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/signout',
		{
			schema: {
				tags: ['Auth'],
				summary: 'Sign Out',
				description: 'Ends the current user session',
			},
		},
		signOut,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/password-reset/request',
		{
			schema: {
				tags: ['Auth'],
				summary: 'Request Password Reset',
				description: 'Sends a password reset link to the user email',
				body: requestPasswordResetSchema,
			},
		},
		requestPasswordResetController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/password-reset/confirm',
		{
			schema: {
				tags: ['Auth'],
				summary: 'Confirm Password Reset',
				description: 'Sets a new password using the password reset token',
				body: confirmPasswordSchema,
			},
		},
		confirmPasswordController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/email-verification/confirm',
		{
			schema: {
				tags: ['Auth'],
				summary: 'Confirm Email Verification',
				description: 'Confirms the user email using the email verification token and activates the account',
				body: confirmEmailSchema,
			},
		},
		confirmEmailController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/email-verification/resend',
		{
			schema: {
				tags: ['Auth'],
				summary: 'Resend Email Verification',
				description: 'Resends the email verification token to a user whose email is not verified yet',
				body: resendEmailVerificationSchema,
			},
		},
		resendEmailVerificationController,
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
