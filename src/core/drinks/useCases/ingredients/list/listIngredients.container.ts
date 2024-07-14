import { resolveIngredientsRepository } from '@/core/drinks/container';
import { ListIngredientsService } from './ListIngredients.service';

const ingredientRepository = resolveIngredientsRepository();

const listIngredientsService = new ListIngredientsService(ingredientRepository);
export const resolveListIngredientsService = () => listIngredientsService;
