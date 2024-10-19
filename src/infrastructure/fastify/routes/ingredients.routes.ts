import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { createIngredientSchema } from '@/core/drinks/useCases/ingredients/create/createIngredient.schema';
import { createIngredientController } from '@/core/drinks/useCases/ingredients/create/CreateIngredient.controller';
import { getIngredientSchema } from '@/core/drinks/useCases/ingredients/get/getIngredient.schema';
import { getIngredientController } from '@/core/drinks/useCases/ingredients/get/getIngredient.controller';
import { listIngredientsSchema } from '@/core/drinks/useCases/ingredients/list/listIngredients.schema';
import { listIngredientsController } from '@/core/drinks/useCases/ingredients/list/listIngredients.controller';
import { updateIngredientSchema } from '@/core/drinks/useCases/ingredients/update/updateIngredient.schema';
import { updateIngredientController } from '@/core/drinks/useCases/ingredients/update/updateIngredient.controller';
import { deleteIngredientSchema } from '@/core/drinks/useCases/ingredients/delete/deleteIngredient.schema';
import { deleteIngredientController } from '@/core/drinks/useCases/ingredients/delete/deleteIngredient.controller';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post(
		'/ingredients',
		{
			schema: {
				tags: ['Ingredients'],
				body: createIngredientSchema,
			},
			preValidation: [verifyAndRenewToken],
		},
		createIngredientController,
	);

	server.withTypeProvider<ZodTypeProvider>().get(
		'/ingredients/:id',
		{
			schema: {
				tags: ['Ingredients'],
				params: getIngredientSchema,
			},
		},
		getIngredientController,
	);

	server.withTypeProvider<ZodTypeProvider>().get(
		'/ingredients',
		{
			schema: {
				tags: ['Ingredients'],
				querystring: listIngredientsSchema,
			},
		},
		listIngredientsController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/ingredients',
		{
			schema: {
				tags: ['Ingredients'],
				body: updateIngredientSchema,
			},
			preValidation: [verifyAndRenewToken],
		},
		updateIngredientController,
	);

	server.withTypeProvider<ZodTypeProvider>().delete(
		'/ingredients',
		{
			schema: {
				tags: ['Ingredients'],
				body: deleteIngredientSchema,
			},
			preValidation: [verifyAndRenewToken],
		},
		deleteIngredientController,
	);
};

export const ingredientsRoutes = pluginGenerator(routes);
