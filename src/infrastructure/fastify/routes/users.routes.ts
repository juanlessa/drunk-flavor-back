import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { createUserController } from '@/core/accounts/useCases/createUser/createUser.controller';
import { createUserSchema } from '@/core/accounts/useCases/createUser/createUser.schema';
import { deleteUserSchema } from '@/core/accounts/useCases/deleteUser/deleteUser.schema';
import { deleteUserController } from '@/core/accounts/useCases/deleteUser/deleteUser.controller';
import { listUsersQuerySchema } from '@/core/accounts/useCases/listUsers/listUsers.schema';
import { listUsersController } from '@/core/accounts/useCases/listUsers/listUsers.controller';
import { getUserSchema } from '@/core/accounts/useCases/getUser/getUser.schema';
import { getUserController } from '@/core/accounts/useCases/getUser/getUser.controller';
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

	server
		.withTypeProvider<ZodTypeProvider>()
		.get(
			'/users/:id',
			{ schema: { params: getUserSchema }, preValidation: [verifyAndRenewToken] },
			getUserController,
		);

	server.get(
		'/users',
		{ schema: { querystring: listUsersQuerySchema }, preValidation: [verifyAndRenewToken] },
		listUsersController,
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
