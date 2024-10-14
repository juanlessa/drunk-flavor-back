import { resolveDrinksRepository, resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { CreateDrinkService } from './CreateDrink.service';

const drinksRepository = resolveDrinksRepository();
const ingredientsRepository = resolveIngredientsRepository();

const createDrinkService = new CreateDrinkService(drinksRepository, ingredientsRepository);
export const resolveCreateDrinkService = () => createDrinkService;
