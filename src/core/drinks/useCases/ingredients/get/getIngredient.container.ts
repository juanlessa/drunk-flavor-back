import { resolveIngredientsRepository } from '@/core/drinks/container';
import { GetIngredientService } from './GetIngredient.service';

const ingredientsRepository = resolveIngredientsRepository();

const getIngredientService = new GetIngredientService(ingredientsRepository);
export const resolveGetIngredientService = () => getIngredientService;