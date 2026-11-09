import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../../helpers/fastify.helpers';
import { Routes } from '../../types/fastify.types';
import { verifyAndRenewToken } from '../../middlewares/verifyAndRenewToken';
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
import { verifyPermissions } from '../../middlewares/verifyPermissions';
import { enforceCompleteProfile } from '../../middlewares/enforceCompleteProfile';

import { listIngredientsWithAuthorshipController } from '@/core/drinks/useCases/ingredients/listWithAuthorship/listIngredientsWithAuthorship.controller';
import { getIngredientWithAuthorshipController } from '@/core/drinks/useCases/ingredients/getWithAuthorship/getIngredientWithAuthorship.controller';
const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post(
		'/ingredients',
		{
			schema: {
				tags: ['Ingredients'],
				body: createIngredientSchema,
			},
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('create', 'Ingredient')],
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

	// For the people who contribute to the catalog (partner, admin, owner): their own records first, and who created and last edited each one.
	server.withTypeProvider<ZodTypeProvider>().get(
		'/ingredients/me',
		{
			schema: { tags: ['Ingredients'], querystring: listIngredientsSchema },
			preValidation: [
				verifyAndRenewToken,
				enforceCompleteProfile,
				verifyPermissions('listWithAuthorship', 'Ingredient'),
			],
		},
		listIngredientsWithAuthorshipController,
	);
	server.withTypeProvider<ZodTypeProvider>().get(
		'/ingredients/me/:id',
		{
			schema: { tags: ['Ingredients'], params: getIngredientSchema },
			preValidation: [
				verifyAndRenewToken,
				enforceCompleteProfile,
				verifyPermissions('getWithAuthorship', 'Ingredient'),
			],
		},
		getIngredientWithAuthorshipController,
	);
	server.withTypeProvider<ZodTypeProvider>().patch(
		'/ingredients',
		{
			schema: {
				tags: ['Ingredients'],
				body: updateIngredientSchema,
			},
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('update', 'Ingredient')],
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
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('delete', 'Ingredient')],
		},
		deleteIngredientController,
	);
};

export const ingredientsRoutes = pluginGenerator(routes);
