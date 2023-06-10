import { Router } from 'express';
import { CreateIngredientController } from '@modules/drinks/useCases/createIngredient/CreateIngredientController';
import { ListIngredientsController } from '@modules/drinks/useCases/listIngredients/ListIngredientsController';
import { UpdateIngredientController } from '@modules/drinks/useCases/updateIngredient/UpdateIngredientController';
import { DeleteIngredientController } from '@modules/drinks/useCases/deleteIngredient/DeleteIngredientController';
import { GetIngredientController } from '@modules/drinks/useCases/getIngredient/GetIngredientController';

import { ensureAuthenticated } from '@shared/infra/http/middlewares/ensureAuthenticated';
const createIngredientController = new CreateIngredientController();
const listIngredientsController = new ListIngredientsController();
const updateIngredientController = new UpdateIngredientController();
const deleteIngredientController = new DeleteIngredientController();
const getIngredientController = new GetIngredientController();

const ingredientsRoutes = Router();

ingredientsRoutes.post('/', createIngredientController.handle);
ingredientsRoutes.get('/', ensureAuthenticated, listIngredientsController.handle);
ingredientsRoutes.get('/:id', getIngredientController.handle);
ingredientsRoutes.patch('/', updateIngredientController.handle);
ingredientsRoutes.delete('/', deleteIngredientController.handle);

export default ingredientsRoutes;
