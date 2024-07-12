import { resolveIngredientsRepository } from '@/modules/drinks/container';
import { DeleteIngredientService } from './DeleteIngredient.service';

const ingredientRepository = resolveIngredientsRepository();

const deleteIngredientService = new DeleteIngredientService(ingredientRepository);
export const resolveDeleteIngredientService = () => deleteIngredientService;
