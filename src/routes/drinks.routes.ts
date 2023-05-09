import { Router } from "express";
import { CreateDrinkController } from '@modules/drinks/useCases/createDrink/CreateDrinkController'
import { ListDrinksController } from '@modules/drinks/useCases/listDrinks/ListDrinksController'
import { GetDrinkController } from '@modules/drinks/useCases/getDrink/GetDrinkController'


const createDrinkController = new CreateDrinkController();
const listDrinksController = new ListDrinksController();
const getDrinkController = new GetDrinkController();

const drinksRoutes = Router();

drinksRoutes.post("/", createDrinkController.handle);
drinksRoutes.get("/", listDrinksController.handle);
drinksRoutes.get("/:id", getDrinkController.handle);


export default drinksRoutes;
