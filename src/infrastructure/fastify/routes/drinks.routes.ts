import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { createDrinkSchema } from '@/core/drinks/useCases/drinks/create/createDrink.schema';
import { createDrinkController } from '@/core/drinks/useCases/drinks/create/createDrink.controller';
import { getDrinkSchema } from '@/core/drinks/useCases/drinks/get/getDrink.schema';
import { getDrinkController } from '@/core/drinks/useCases/drinks/get/getDrink.controller';
import { listDrinksSchema } from '@/core/drinks/useCases/drinks/list/listDrinks.schema';
import { listDrinksController } from '@/core/drinks/useCases/drinks/list/listDrinks.controller';
import { updateDrinkSchema } from '@/core/drinks/useCases/drinks/update/updateDrink.schema';
import { updateDrinkController } from '@/core/drinks/useCases/drinks/update/updateDrink.controller';
import { updateDrinkCoverSchema } from '@/core/drinks/useCases/drinks/updateCover/updateDrinkCover.schema';
import { updateDrinkCoverController } from '@/core/drinks/useCases/drinks/updateCover/updateDrinkCover.controller';
import { deleteDrinkSchema } from '@/core/drinks/useCases/drinks/delete/deleteDrink.schema';
import { deleteDrinkController } from '@/core/drinks/useCases/drinks/delete/deleteDrink.controller';

const routes: Routes = (server) => {
	server
		.withTypeProvider<ZodTypeProvider>()
		.post(
			'/drinks',
			{ schema: { body: createDrinkSchema }, onRequest: [verifyAndRenewToken] },
			createDrinkController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/drinks/:id', { schema: { params: getDrinkSchema } }, getDrinkController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/drinks', { schema: { querystring: listDrinksSchema } }, listDrinksController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.patch(
			'/drinks',
			{ schema: { body: updateDrinkSchema }, onRequest: [verifyAndRenewToken] },
			updateDrinkController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.patch('/drinks/:id/cover', { schema: { params: updateDrinkCoverSchema } }, updateDrinkCoverController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.delete(
			'/drinks',
			{ schema: { body: deleteDrinkSchema }, onRequest: [verifyAndRenewToken] },
			deleteDrinkController,
		);
};

export const drinksRoutes = pluginGenerator(routes);
