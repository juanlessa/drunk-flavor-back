import { CreateIngredientController } from '@modules/drinks/useCases/createIngredient/CreateIngredientController';
import { DeleteIngredientController } from '@modules/drinks/useCases/deleteIngredient/DeleteIngredientController';
import { GetIngredientController } from '@modules/drinks/useCases/getIngredient/GetIngredientController';
import { ListIngredientsController } from '@modules/drinks/useCases/listIngredients/ListIngredientsController';
import { UpdateIngredientController } from '@modules/drinks/useCases/updateIngredient/UpdateIngredientController';
import { ensureAuthenticated } from '@shared/infra/http/middlewares/ensureAuthenticated';
import { Router } from 'express';

const createIngredientController = new CreateIngredientController();
const listIngredientsController = new ListIngredientsController();
const updateIngredientController = new UpdateIngredientController();
const deleteIngredientController = new DeleteIngredientController();
const getIngredientController = new GetIngredientController();

const ingredientsRoutes = Router();

ingredientsRoutes.post('/', ensureAuthenticated, createIngredientController.handle);
ingredientsRoutes.get('/', ensureAuthenticated, listIngredientsController.handle);
ingredientsRoutes.get('/:id', ensureAuthenticated, getIngredientController.handle);
ingredientsRoutes.patch('/', ensureAuthenticated, updateIngredientController.handle);
ingredientsRoutes.delete('/', ensureAuthenticated, deleteIngredientController.handle);

export default ingredientsRoutes;
