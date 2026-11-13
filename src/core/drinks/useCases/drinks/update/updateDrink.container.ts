import { resolveDrinksRepository, resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { UpdateDrinkService } from './UpdateDrink.service';

const drinksRepository = resolveDrinksRepository();
const ingredientsRepository = resolveIngredientsRepository();

const updateDrinkService = new UpdateDrinkService(drinksRepository, ingredientsRepository);

export const resolveUpdateDrinkService = () => updateDrinkService;
