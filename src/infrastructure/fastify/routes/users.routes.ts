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
import { verifyPermissions } from '../middlewares/verifyPermissions';
import { enforceCompleteProfile } from '../middlewares/enforceCompleteProfile';
import { requireRecentAuthentication } from '../middlewares/requireRecentAuthentication';
import { closeUserBodySchema, closeUserParamsSchema } from '@/core/accounts/useCases/users/close/closeUser.schema';
import { closeUserController } from '@/core/accounts/useCases/users/close/closeUser.controller';
import {
	suspendUserBodySchema,
	suspendUserParamsSchema,
} from '@/core/accounts/useCases/users/suspend/suspendUser.schema';
import { suspendUserController } from '@/core/accounts/useCases/users/suspend/suspendUser.controller';
import {
	reactivateUserBodySchema,
	reactivateUserParamsSchema,
} from '@/core/accounts/useCases/users/reactivate/reactivateUser.schema';
import { reactivateUserController } from '@/core/accounts/useCases/users/reactivate/reactivateUser.controller';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post(
		'/users',
		{
			schema: {
				tags: ['Users'],
				body: createUserSchema,
			},
			preValidation: [
				verifyAndRenewToken,
				enforceCompleteProfile,
				requireRecentAuthentication,
				verifyPermissions('create', 'User'),
			],
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
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('get', 'User')],
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
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('list', 'User')],
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
			preValidation: [
				verifyAndRenewToken,
				enforceCompleteProfile,
				requireRecentAuthentication,
				verifyPermissions('changeRole', 'User'),
			],
		},
		updateUserRoleController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/users/:id/closure',
		{
			schema: {
				tags: ['Users'],
				params: closeUserParamsSchema,
				body: closeUserBodySchema,
			},
			preValidation: [
				verifyAndRenewToken,
				enforceCompleteProfile,
				requireRecentAuthentication,
				verifyPermissions('close', 'User'),
			],
		},
		closeUserController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/users/:id/suspension',
		{
			schema: {
				tags: ['Users'],
				params: suspendUserParamsSchema,
				body: suspendUserBodySchema,
			},
			preValidation: [
				verifyAndRenewToken,
				enforceCompleteProfile,
				requireRecentAuthentication,
				verifyPermissions('suspend', 'User'),
			],
		},
		suspendUserController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/users/:id/reactivation',
		{
			schema: {
				tags: ['Users'],
				params: reactivateUserParamsSchema,
				body: reactivateUserBodySchema,
			},
			preValidation: [
				verifyAndRenewToken,
				enforceCompleteProfile,
				requireRecentAuthentication,
				verifyPermissions('reactivate', 'User'),
			],
		},
		reactivateUserController,
	);
};

export const usersRoutes = pluginGenerator(routes);
