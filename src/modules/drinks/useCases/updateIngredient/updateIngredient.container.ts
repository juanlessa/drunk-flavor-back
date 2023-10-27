import { resolveCategoriesRepository, resolveIngredientsRepository } from '@modules/drinks/container';
import { UpdateIngredientService } from './UpdateIngredient.service';

const categoriesRepository = resolveCategoriesRepository();
const ingredientRepository = resolveIngredientsRepository();

const updateIngredientService = new UpdateIngredientService(ingredientRepository, categoriesRepository);
export const resolveUpdateIngredientService = () => updateIngredientService;
