import { CreateIngredientController } from '@modules/drinks/useCases/createIngredient/CreateIngredient.controller';
import { createIngredientValidator } from '@modules/drinks/useCases/createIngredient/createIngredient.schema';
import { DeleteIngredientController } from '@modules/drinks/useCases/deleteIngredient/DeleteIngredient.controller';
import { deleteIngredientValidator } from '@modules/drinks/useCases/deleteIngredient/deleteIngredient.schema';
import { GetIngredientController } from '@modules/drinks/useCases/getIngredient/GetIngredient.controller';
import { ListIngredientsController } from '@modules/drinks/useCases/listIngredients/ListIngredients.controller';
import { UpdateIngredientController } from '@modules/drinks/useCases/updateIngredient/UpdateIngredient.controller';
import { updateIngredientValidator } from '@modules/drinks/useCases/updateIngredient/updateIngredient.schema';
import { Router } from 'express';

const createIngredientController = new CreateIngredientController();
const listIngredientsController = new ListIngredientsController();
const updateIngredientController = new UpdateIngredientController();
const deleteIngredientController = new DeleteIngredientController();
const getIngredientController = new GetIngredientController();

const ingredientsRoutes = Router();

ingredientsRoutes.post('/', createIngredientValidator, createIngredientController.handle);
ingredientsRoutes.get('/', listIngredientsController.handle);
ingredientsRoutes.get('/:id', getIngredientController.handle);
ingredientsRoutes.patch('/', updateIngredientValidator, updateIngredientController.handle);
ingredientsRoutes.delete('/', deleteIngredientValidator, deleteIngredientController.handle);

export default ingredientsRoutes;
