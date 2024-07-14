import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { Routes } from '../types/fastify.types';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { createCategorySchema } from '@/modules/drinks/useCases/categories/create/createCategory.schema';
import { createCategoryController } from '@/modules/drinks/useCases/categories/create/createCategory.controller';
import { deleteCategorySchema } from '@/modules/drinks/useCases/categories/delete/deleteCategory.schema';
import { deleteCategoryController } from '@/modules/drinks/useCases/categories/delete/deleteCategory.controller';
import { getCategorySchema } from '@/modules/drinks/useCases/categories/get/getCategory.schema';
import { getCategoryController } from '@/modules/drinks/useCases/categories/get/getCategory.controller';
import { listCategoryQuerySchema } from '@/modules/drinks/useCases/categories/list/listCategories.schema';
import { listCategoriesController } from '@/modules/drinks/useCases/categories/list/listCategories.controller';
import { updateCategorySchema } from '@/modules/drinks/useCases/categories/update/updateCategory.schema';
import { updateCategoryController } from '@/modules/drinks/useCases/categories/update/updateCategory.controller';

const routes: Routes = (server) => {
	server
		.withTypeProvider<ZodTypeProvider>()
		.post(
			'/categories',
			{ schema: { body: createCategorySchema }, onRequest: [verifyAndRenewToken] },
			createCategoryController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/categories/:id', { schema: { params: getCategorySchema } }, getCategoryController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/categories', { schema: { querystring: listCategoryQuerySchema } }, listCategoriesController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.patch(
			'/categories',
			{ schema: { body: updateCategorySchema }, onRequest: [verifyAndRenewToken] },
			updateCategoryController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.delete(
			'/categories',
			{ schema: { body: deleteCategorySchema }, onRequest: [verifyAndRenewToken] },
			deleteCategoryController,
		);
};

export const categoriesRoutes = pluginGenerator(routes);
