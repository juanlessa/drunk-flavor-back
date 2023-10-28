import { resolveIngredientsRepository } from '@modules/drinks/container';
import { DeleteIngredientService } from '@modules/drinks/useCases/deleteIngredient/DeleteIngredient.service';

const ingredientRepository = resolveIngredientsRepository();

const deleteIngredientService = new DeleteIngredientService(ingredientRepository);
export const resolveDeleteIngredientService = () => deleteIngredientService;
