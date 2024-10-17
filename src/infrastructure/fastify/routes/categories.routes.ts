import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { createCategorySchema } from '@/core/drinks/useCases/categories/create/createCategory.schema';
import { createCategoryController } from '@/core/drinks/useCases/categories/create/createCategory.controller';
import { deleteCategorySchema } from '@/core/drinks/useCases/categories/delete/deleteCategory.schema';
import { deleteCategoryController } from '@/core/drinks/useCases/categories/delete/deleteCategory.controller';
import { getCategorySchema } from '@/core/drinks/useCases/categories/get/getCategory.schema';
import { getCategoryController } from '@/core/drinks/useCases/categories/get/getCategory.controller';
import { listCategoriesQuerySchema } from '@/core/drinks/useCases/categories/list/listCategories.schema';
import { listCategoriesController } from '@/core/drinks/useCases/categories/list/listCategories.controller';
import { updateCategorySchema } from '@/core/drinks/useCases/categories/update/updateCategory.schema';
import { updateCategoryController } from '@/core/drinks/useCases/categories/update/updateCategory.controller';
import { verifyPermissions } from '../middlewares/verifyPermissions';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post(
		'/categories',
		{
			schema: { body: createCategorySchema },
			preValidation: [verifyAndRenewToken, verifyPermissions('create', 'Category')],
		},
		createCategoryController,
	);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/categories/:id', { schema: { params: getCategorySchema } }, getCategoryController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/categories', { schema: { querystring: listCategoriesQuerySchema } }, listCategoriesController);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/categories',
		{
			schema: { body: updateCategorySchema },
			preValidation: [verifyAndRenewToken, verifyPermissions('update', 'Category')],
		},
		updateCategoryController,
	);

	server.withTypeProvider<ZodTypeProvider>().delete(
		'/categories',
		{
			schema: { body: deleteCategorySchema },
			preValidation: [verifyAndRenewToken, verifyPermissions('delete', 'Category')],
		},
		deleteCategoryController,
	);
};

export const categoriesRoutes = pluginGenerator(routes);
