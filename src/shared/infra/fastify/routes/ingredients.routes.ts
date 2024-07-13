import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { createIngredientSchema } from '@/modules/drinks/useCases/ingredients/create/createIngredient.schema';
import { createIngredientController } from '@/modules/drinks/useCases/ingredients/create/CreateIngredient.controller';
import { getIngredientSchema } from '@/modules/drinks/useCases/ingredients/get/getIngredient.schema';
import { getIngredientController } from '@/modules/drinks/useCases/ingredients/get/getIngredient.controller';
import { listIngredientsController } from '@/modules/drinks/useCases/ingredients/list/listIngredients.controller';
import { updateIngredientSchema } from '@/modules/drinks/useCases/ingredients/update/updateIngredient.schema';
import { updateIngredientController } from '@/modules/drinks/useCases/ingredients/update/updateIngredient.controller';
import { deleteIngredientSchema } from '@/modules/drinks/useCases/ingredients/delete/deleteIngredient.schema';
import { deleteIngredientController } from '@/modules/drinks/useCases/ingredients/delete/deleteIngredient.controller';

const routes: Routes = (server) => {
	server
		.withTypeProvider<ZodTypeProvider>()
		.post(
			'/ingredients',
			{ schema: { body: createIngredientSchema }, onRequest: [verifyAndRenewToken] },
			createIngredientController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/ingredients/:id', { schema: { params: getIngredientSchema } }, getIngredientController);

	server.withTypeProvider<ZodTypeProvider>().get('/ingredients', {}, listIngredientsController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.patch(
			'/ingredients',
			{ schema: { body: updateIngredientSchema }, onRequest: [verifyAndRenewToken] },
			updateIngredientController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.delete(
			'/ingredients',
			{ schema: { body: deleteIngredientSchema }, onRequest: [verifyAndRenewToken] },
			deleteIngredientController,
		);
};

export const ingredientsRoutes = pluginGenerator(routes);
