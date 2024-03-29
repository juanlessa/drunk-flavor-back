import { resolveDrinksRepository, resolveIngredientsRepository } from '@modules/drinks/container';
import { CreateDrinkService } from '@modules/drinks/useCases/createDrink/CreateDrink.service';

const drinksRepository = resolveDrinksRepository();
const ingredientRepository = resolveIngredientsRepository();

const createDrinkService = new CreateDrinkService(drinksRepository, ingredientRepository);
export const resolveCreateDrinkService = () => createDrinkService;
