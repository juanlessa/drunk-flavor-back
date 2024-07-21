import { resolveIngredientsRepository } from '@/core/drinks/container';
import { DeleteIngredientService } from './DeleteIngredient.service';

const ingredientsRepository = resolveIngredientsRepository();

const deleteIngredientService = new DeleteIngredientService(ingredientsRepository);
export const resolveDeleteIngredientService = () => deleteIngredientService;
