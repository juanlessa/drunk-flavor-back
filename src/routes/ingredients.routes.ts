import { Router } from "express";
import { CreateIngredientController } from '@modules/drinks/useCases/createIngredient/CreateIngredientController'
import { ListIngredientsController } from '@modules/drinks/useCases/listIngredients/ListIngredientsController'


const createIngredientController = new CreateIngredientController();
const listIngredientsController = new ListIngredientsController()

const ingredientsRoutes = Router();

ingredientsRoutes.post("/", createIngredientController.handle);
ingredientsRoutes.get("/", listIngredientsController.handle);


export default ingredientsRoutes;
