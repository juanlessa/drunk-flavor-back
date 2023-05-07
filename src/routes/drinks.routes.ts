import { Router } from "express";
import { CreateDrinkController } from '@modules/drinks/useCases/createDrink/CreateDrinkController'
import { ListDrinksController } from '@modules/drinks/useCases/listDrink/ListDrinksController'


const createDrinkController = new CreateDrinkController();
const listDrinksController = new ListDrinksController();

const drinksRoutes = Router();

drinksRoutes.post("/", createDrinkController.handle);
drinksRoutes.get("/", listDrinksController.handle);


export default drinksRoutes;
