import { resolveCategoriesRepository, resolveIngredientsRepository } from '@modules/drinks/container';
import { CreateIngredientService } from '@modules/drinks/useCases/createIngredient/CreateIngredient.service';

const categoriesRepository = resolveCategoriesRepository();
const ingredientRepository = resolveIngredientsRepository();

const createIngredientService = new CreateIngredientService(ingredientRepository, categoriesRepository);
export const resolveCreateIngredientService = () => createIngredientService;
