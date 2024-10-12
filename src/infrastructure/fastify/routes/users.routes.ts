import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { createUserController } from '@/core/accounts/useCases/createUser/createUser.controller';
import { createUserSchema } from '@/core/accounts/useCases/createUser/createUser.schema';
import { getUserProfileController } from '@/core/accounts/useCases/getUserProfile/getUserProfile.controller';
import { deleteUserSchema } from '@/core/accounts/useCases/deleteUser/deleteUser.schema';
import { deleteUserController } from '@/core/accounts/useCases/deleteUser/deleteUser.controller';
import { listUsersController } from '@/core/accounts/useCases/listUsers/listUsers.controller';
import { updateUserProfileSchema } from '@/core/accounts/useCases/updateUserProfile/updateUserProfile.schema';
import { updateUserProfileController } from '@/core/accounts/useCases/updateUserProfile/updateUserProfile.controller';
import { updateUserRoleSchema } from '@/core/accounts/useCases/updateUserRole/updateUserRole.schema';
import { updateUserRoleController } from '@/core/accounts/useCases/updateUserRole/updateUserRole.controller';

const routes: Routes = (server) => {
	server
		.withTypeProvider<ZodTypeProvider>()
		.post(
			'/users',
			{ schema: { body: createUserSchema }, preValidation: [verifyAndRenewToken] },
			createUserController,
		);

	server.get('/users/me', { preValidation: [verifyAndRenewToken] }, getUserProfileController);

	server.get('/users', { preValidation: [verifyAndRenewToken] }, listUsersController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.patch(
			'/users/me',
			{ schema: { body: updateUserProfileSchema }, preValidation: [verifyAndRenewToken] },
			updateUserProfileController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.patch(
			'/users/role',
			{ schema: { body: updateUserRoleSchema }, preValidation: [verifyAndRenewToken] },
			updateUserRoleController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.delete(
			'/users',
			{ schema: { body: deleteUserSchema }, preValidation: [verifyAndRenewToken] },
			deleteUserController,
		);
};

export const usersRoutes = pluginGenerator(routes);
