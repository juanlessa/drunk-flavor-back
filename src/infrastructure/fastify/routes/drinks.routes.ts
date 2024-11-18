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
import { updateDrinkThumbnailSchema } from '@/core/drinks/useCases/drinks/updateThumbnail/updateDrinkThumbnail.schema';
import { updateDrinkThumbnailController } from '@/core/drinks/useCases/drinks/updateThumbnail/updateDrinkThumbnail.controller';
import { deleteDrinkSchema } from '@/core/drinks/useCases/drinks/delete/deleteDrink.schema';
import { deleteDrinkController } from '@/core/drinks/useCases/drinks/delete/deleteDrink.controller';
import { verifyPermissions } from '../middlewares/verifyPermissions';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post(
		'/drinks',
		{
			schema: {
				tags: ['Drinks'],
				body: createDrinkSchema,
			},
			preValidation: [verifyAndRenewToken, verifyPermissions('create', 'Drink')],
		},
		createDrinkController,
	);

	server.withTypeProvider<ZodTypeProvider>().get(
		'/drinks/:id',
		{
			schema: {
				tags: ['Drinks'],
				params: getDrinkSchema,
			},
		},
		getDrinkController,
	);

	server.withTypeProvider<ZodTypeProvider>().get(
		'/drinks',
		{
			schema: {
				tags: ['Drinks'],
				querystring: listDrinksSchema,
			},
		},
		listDrinksController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/drinks',
		{
			schema: {
				tags: ['Drinks'],
				body: updateDrinkSchema,
			},
			preValidation: [verifyAndRenewToken, verifyPermissions('update', 'Drink')],
		},
		updateDrinkController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/drinks/:id/cover',
		{
			schema: {
				tags: ['Drinks'],
				params: updateDrinkCoverSchema,
			},
			preValidation: [verifyAndRenewToken, verifyPermissions('update', 'Drink')],
		},
		updateDrinkCoverController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/drinks/:id/thumbnail',
		{
			schema: {
				tags: ['Drinks'],
				params: updateDrinkThumbnailSchema,
			},
			preValidation: [verifyAndRenewToken, verifyPermissions('update', 'Drink')],
		},
		updateDrinkThumbnailController,
	);

	server.withTypeProvider<ZodTypeProvider>().delete(
		'/drinks',
		{
			schema: {
				tags: ['Drinks'],
				body: deleteDrinkSchema,
			},
			preValidation: [verifyAndRenewToken, verifyPermissions('delete', 'Drink')],
		},
		deleteDrinkController,
	);
};

export const drinksRoutes = pluginGenerator(routes);
