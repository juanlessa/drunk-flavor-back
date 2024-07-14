import { resolveIngredientsRepository } from '@/core/drinks/container';
import { GetIngredientService } from './GetIngredient.service';

const ingredientRepository = resolveIngredientsRepository();

const getIngredientService = new GetIngredientService(ingredientRepository);
export const resolveGetIngredientService = () => getIngredientService;