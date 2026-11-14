import { resolveDrinksRepository, resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { ListIngredientsService } from './ListIngredients.service';

const ingredientsRepository = resolveIngredientsRepository();

const drinksRepository = resolveDrinksRepository();
const listIngredientsService = new ListIngredientsService(ingredientsRepository, drinksRepository);

export const resolveListIngredientsService = () => listIngredientsService;
