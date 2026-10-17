import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { createUserSchema } from '@/core/accounts/useCases/users/create/createUser.schema';
import { createUserController } from '@/core/accounts/useCases/users/create/createUser.controller';
import { getUserSchema } from '@/core/accounts/useCases/users/get/getUser.schema';
import { getUserController } from '@/core/accounts/useCases/users/get/getUser.controller';
import { listUsersQuerySchema } from '@/core/accounts/useCases/users/list/listUsers.schema';
import { listUsersController } from '@/core/accounts/useCases/users/list/listUsers.controller';
import { updateUserRoleSchema } from '@/core/accounts/useCases/users/updateRole/updateUserRole.schema';
import { updateUserRoleController } from '@/core/accounts/useCases/users/updateRole/updateUserRole.controller';
import { deleteUserSchema } from '@/core/accounts/useCases/users/delete/deleteUser.schema';
import { deleteUserController } from '@/core/accounts/useCases/users/delete/deleteUser.controller';
import { verifyPermissions } from '../middlewares/verifyPermissions';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post(
		'/users',
		{
			schema: {
				tags: ['Users'],
				body: createUserSchema,
			},
			preValidation: [verifyAndRenewToken, verifyPermissions('create', 'User')],
		},
		createUserController,
	);

	server.withTypeProvider<ZodTypeProvider>().get(
		'/users/:id',
		{
			schema: {
				tags: ['Users'],
				params: getUserSchema,
			},
			preValidation: [verifyAndRenewToken, verifyPermissions('get', 'User')],
		},
		getUserController,
	);

	server.get(
		'/users',
		{
			schema: {
				tags: ['Users'],
				querystring: listUsersQuerySchema,
			},
			preValidation: [verifyAndRenewToken, verifyPermissions('list', 'User')],
		},
		listUsersController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/users/role',
		{
			schema: {
				tags: ['Users'],
				body: updateUserRoleSchema,
			},
			preValidation: [verifyAndRenewToken, verifyPermissions('update', 'User')],
		},
		updateUserRoleController,
	);

	server.withTypeProvider<ZodTypeProvider>().delete(
		'/users',
		{
			schema: {
				tags: ['Users'],
				body: deleteUserSchema,
			},
			preValidation: [verifyAndRenewToken, verifyPermissions('delete', 'User')],
		},
		deleteUserController,
	);
};

export const usersRoutes = pluginGenerator(routes);
