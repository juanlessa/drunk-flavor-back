import { resolveIngredientsRepository } from '@modules/drinks/container';
import { ListIngredientsService } from './ListIngredients.service';

const ingredientRepository = resolveIngredientsRepository();

const listIngredientsService = new ListIngredientsService(ingredientRepository);
export const resolveListIngredientsService = () => listIngredientsService;
