import { resolveIngredientsRepository } from '@modules/drinks/container';
import { GetIngredientService } from '@modules/drinks/useCases/getIngredient/GetIngredient.service';

const ingredientRepository = resolveIngredientsRepository();

const getIngredientService = new GetIngredientService(ingredientRepository);
export const resolveGetIngredientService = () => getIngredientService;
