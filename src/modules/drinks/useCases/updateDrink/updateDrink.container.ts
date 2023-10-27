import { resolveDrinksRepository, resolveIngredientsRepository } from '@modules/drinks/container';
import { UpdateDrinkService } from './UpdateDrink.service';

const drinksRepository = resolveDrinksRepository();
const ingredientRepository = resolveIngredientsRepository();

const updateDrinkService = new UpdateDrinkService(drinksRepository, ingredientRepository);
export const resolveUpdateDrinkService = () => updateDrinkService;
