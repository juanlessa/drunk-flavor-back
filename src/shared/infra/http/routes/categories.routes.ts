import { CreateCategoryController } from '@modules/drinks/useCases/createCategory/CreateCategory.controller';
import { DeleteCategoryController } from '@modules/drinks/useCases/deleteCategory/DeleteCategory.controller';
import { GetCategoryController } from '@modules/drinks/useCases/getCategory/GetCategory.controller';
import { ListCategoriesController } from '@modules/drinks/useCases/listCategories/ListCategories.controller';
import { UpdateCategoryController } from '@modules/drinks/useCases/updateCategory/UpdateCategory.controller';
import { Router } from 'express';
import { ensureAuthenticated } from '@shared/infra/http/middlewares/ensureAuthenticated';
import { createCategoryValidator } from '@modules/drinks/useCases/createCategory/createCategory.schema';
import { deleteCategoryValidator } from '@modules/drinks/useCases/deleteCategory/deleteCategory.schema';
import { updateCategoryValidator } from '@modules/drinks/useCases/updateCategory/updateCategory.schema';

const createCategoryController = new CreateCategoryController();
const listCategoriesController = new ListCategoriesController();
const deleteCategoryController = new DeleteCategoryController();
const getCategoryController = new GetCategoryController();
const updateCategoryController = new UpdateCategoryController();

const categoriesRoutes = Router();

categoriesRoutes.post('/', createCategoryValidator, createCategoryController.handle);
categoriesRoutes.delete('/', deleteCategoryValidator, deleteCategoryController.handle);
categoriesRoutes.get('/', listCategoriesController.handle);
categoriesRoutes.get('/:id', getCategoryController.handle);
categoriesRoutes.patch('/', updateCategoryValidator, updateCategoryController.handle);

export default categoriesRoutes;
