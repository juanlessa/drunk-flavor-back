import { resolveCategoriesRepository, resolveIngredientsRepository } from '@modules/drinks/container';
import { CreateIngredientService } from './CreateIngredient.service';

const categoriesRepository = resolveCategoriesRepository();
const ingredientRepository = resolveIngredientsRepository();

const createIngredientService = new CreateIngredientService(ingredientRepository, categoriesRepository);
export const resolveCreateIngredientService = () => createIngredientService;
