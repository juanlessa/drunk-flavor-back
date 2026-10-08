import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { getProfileController } from '@/core/accounts/useCases/profile/getProfile/getProfile.controller';
import { updateProfileSchema } from '@/core/accounts/useCases/profile/update/updateProfile.schema';
import { updateProfileController } from '@/core/accounts/useCases/profile/update/updateProfile.controller';
import { deleteProfileController } from '@/core/accounts/useCases/profile/deleteProfile/deleteProfile.controller';
import { resetPasswordSchema } from '@/core/accounts/useCases/profile/resetPassword/resetPassword.schema';
import { resetPasswordController } from '@/core/accounts/useCases/profile/resetPassword/resetPassword.controller';
import { updatePasswordSchema } from '@/core/accounts/useCases/profile/updatePassword/updatePassword.schema';
import { updatePasswordController } from '@/core/accounts/useCases/profile/updatePassword/updatePassword.controller';

const routes: Routes = (server) => {
	server.get(
		'/me',
		{
			schema: { tags: ['Profile'] },
			preValidation: [verifyAndRenewToken],
		},
		getProfileController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/me',
		{
			schema: {
				tags: ['Profile'],
				body: updateProfileSchema,
			},
			preValidation: [verifyAndRenewToken],
		},
		updateProfileController,
	);

	server.withTypeProvider<ZodTypeProvider>().delete(
		'/me',
		{
			schema: {
				tags: ['Profile'],
			},
			preValidation: [verifyAndRenewToken],
		},
		deleteProfileController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/reset-password',
		{
			schema: {
				tags: ['Profile'],
				body: resetPasswordSchema,
			},
		},
		resetPasswordController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/update-password',
		{
			schema: {
				tags: ['Profile'],
				body: updatePasswordSchema,
			},
			preValidation: [verifyAndRenewToken],
		},
		updatePasswordController,
	);
};

export const profileRoutes = pluginGenerator(routes);
