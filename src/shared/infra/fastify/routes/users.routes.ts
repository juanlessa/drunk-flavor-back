import { createUserController } from '@/modules/accounts/useCases/createUser/createUser.controller';
import { createUserSchema } from '@/modules/accounts/useCases/createUser/createUser.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { getUserProfileController } from '@/modules/accounts/useCases/getUserProfile/getUserProfile.controller';

const routes: Routes = (server) => {
	server
		.withTypeProvider<ZodTypeProvider>()
		.post('/users', { schema: { body: createUserSchema }, onRequest: [verifyAndRenewToken] }, createUserController);

	server.post('/users/me', { onRequest: [verifyAndRenewToken] }, getUserProfileController);
};

export const usersRoutes = pluginGenerator(routes);
