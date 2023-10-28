import { resolveIngredientsRepository } from '@modules/drinks/container';
import { ListIngredientsService } from '@modules/drinks/useCases/listIngredients/ListIngredients.service';

const ingredientRepository = resolveIngredientsRepository();

const listIngredientsService = new ListIngredientsService(ingredientRepository);
export const resolveListIngredientsService = () => listIngredientsService;
