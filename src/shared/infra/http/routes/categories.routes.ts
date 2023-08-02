import { CreateCategoryController } from '@modules/drinks/useCases/createCategory/CreateCategoryController';
import { DeleteCategoryController } from '@modules/drinks/useCases/deleteCategory/DeleteCategoryController';
import { GetCategoryController } from '@modules/drinks/useCases/getCategory/GetCategoryController';
import { ListCategoriesController } from '@modules/drinks/useCases/listCategories/ListCategoriesController';
import { UpdateCategoryController } from '@modules/drinks/useCases/updateCategory/UpdateCategoryController';
import { Router } from 'express';
import { ensureAuthenticated } from '@shared/infra/http/middlewares/ensureAuthenticated';

const createCategoryController = new CreateCategoryController();
const listCategoriesController = new ListCategoriesController();
const deleteCategoryController = new DeleteCategoryController();
const getCategoryController = new GetCategoryController();
const updateCategoryController = new UpdateCategoryController();

const categoriesRoutes = Router();

categoriesRoutes.post('/', ensureAuthenticated, createCategoryController.handle);
categoriesRoutes.delete('/', ensureAuthenticated, deleteCategoryController.handle);
categoriesRoutes.get('/', ensureAuthenticated, listCategoriesController.handle);
categoriesRoutes.get('/:id', ensureAuthenticated, getCategoryController.handle);
categoriesRoutes.patch('/', ensureAuthenticated, updateCategoryController.handle);

export default categoriesRoutes;
