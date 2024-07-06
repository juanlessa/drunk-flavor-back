import { createUserController } from '@/modules/accounts/useCases/createUser/createUser.controller';
import { createUserSchema } from '@/modules/accounts/useCases/createUser/createUser.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { getUserProfileController } from '@/modules/accounts/useCases/getUserProfile/getUserProfile.controller';
import { deleteUserSchema } from '@/modules/accounts/useCases/deleteUser/deleteUser.schema';
import { deleteUserController } from '@/modules/accounts/useCases/deleteUser/deleteUser.controller';
import { listUsersController } from '@/modules/accounts/useCases/listUsers/listUsers.controller';
import { updateUserProfileSchema } from '@/modules/accounts/useCases/updateUserProfile/updateUserProfile.schema';
import { updateUserProfileController } from '@/modules/accounts/useCases/updateUserProfile/updateUserProfile.controller';
import { updateUserRoleSchema } from '@/modules/accounts/useCases/updateUserRole/updateUserRole.schema';
import { updateUserRoleController } from '@/modules/accounts/useCases/updateUserRole/updateUserRole.controller';

const routes: Routes = (server) => {
	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/users', { schema: { body: createUserSchema }, onRequest: [verifyAndRenewToken] }, createUserController);

	server.get('/users/me', { onRequest: [verifyAndRenewToken] }, getUserProfileController);

	server.get('/users', { onRequest: [verifyAndRenewToken] }, listUsersController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.patch(
			'/users/me',
			{ schema: { body: updateUserProfileSchema }, onRequest: [verifyAndRenewToken] },
			updateUserProfileController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.patch(
			'/users/role',
			{ schema: { body: updateUserRoleSchema }, onRequest: [verifyAndRenewToken] },
			updateUserRoleController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.delete(
			'/users',
			{ schema: { body: deleteUserSchema }, onRequest: [verifyAndRenewToken] },
			deleteUserController,
		);
};

export const usersRoutes = pluginGenerator(routes);
