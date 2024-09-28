import { resolveDrinksRepository, resolveIngredientsRepository } from '@/core/drinks/container';
import { UpdateDrinkService } from './UpdateDrink.service';

const ingredientsRepository = resolveIngredientsRepository();
const drinksRepository = resolveDrinksRepository();

const updateDrinkService = new UpdateDrinkService(drinksRepository, ingredientsRepository);
export const resolveUpdateDrinkService = () => updateDrinkService;
